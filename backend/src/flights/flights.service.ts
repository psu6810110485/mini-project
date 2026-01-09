import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from '../entities/flight.entity';
import { CreateFlightDto } from './dto/create-flight.dto';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
  ) {}

  async findAll(): Promise<Flight[]> {
    return await this.flightRepository.find();
  }

  async findOne(flight_id: number): Promise<Flight> {
    const flight = await this.flightRepository.findOne({ where: { flight_id } });
    if (!flight) {
      throw new NotFoundException(`ไม่พบเที่ยวบินรหัส ${flight_id}`);
    }
    return flight;
  }

  // ✅ งานเดิม - จับคู่ DTO กับ Database
  async create(dto: CreateFlightDto): Promise<Flight> {
    const flight = this.flightRepository.create({
      flight_code: dto.flightCode,
      origin: dto.origin,
      destination: dto.destination,
      travel_date: new Date(dto.travelDate),
      price: dto.price,
      available_seats: dto.availableSeats,
      status: 'Active'
    });
    
    return await this.flightRepository.save(flight);
  }

  async update(flight_id: number, updateData: Partial<Flight>): Promise<Flight> {
    const flight = await this.findOne(flight_id);
    Object.assign(flight, updateData);
    return await this.flightRepository.save(flight);
  }

  async remove(flight_id: number): Promise<void> {
    const result = await this.flightRepository.delete(flight_id);
    if (result.affected === 0) {
      throw new NotFoundException(`ไม่สามารถลบได้ เนื่องจากไม่พบรหัส ${flight_id}`);
    }
  }

  // ✅ งานเดิม - ตัดที่นั่ง (พร้อมป้องกัน Race Condition ด้วย @VersionColumn)
  async decrementSeats(flight_id: number, count: number): Promise<void> {
    const flight = await this.findOne(flight_id);
    
    if (flight.available_seats < count) {
      throw new BadRequestException('ขออภัย จำนวนที่นั่งว่างไม่เพียงพอ');
    }
    
    flight.available_seats -= count;
    
    try {
      await this.flightRepository.save(flight);
      console.log(`✅ ตัดที่นั่ง ${count} ที่นั่งจากเที่ยวบิน ${flight.flight_code} สำเร็จ`);
    } catch (error: any) {
      // ✅ จัดการ Optimistic Lock Error (Race Condition)
      if (error.name === 'OptimisticLockVersionMismatchError') {
        throw new ConflictException('ที่นั่งถูกจองไปแล้วในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }
      throw error;
    }
  }

  // 🔥 ✅ [NEW] ฟังก์ชันยกเลิกเที่ยวบิน (ใช้งาน Status Field)
  async cancelFlight(flight_id: number): Promise<Flight> {
    const flight = await this.findOne(flight_id);

    // ป้องกันการยกเลิกซ้ำ
    if (flight.status === 'Cancelled') {
      throw new BadRequestException(`เที่ยวบิน ${flight.flight_code} ถูกยกเลิกไปแล้ว`);
    }

    flight.status = 'Cancelled';
    const updated = await this.flightRepository.save(flight);
    
    console.log(`✅ ยกเลิกเที่ยวบิน ${flight.flight_code} สำเร็จ`);
    return updated;
  }

  // 🔥 ✅ [NEW] ฟังก์ชันเปิดเที่ยวบินใหม่ (กรณียกเลิกผิด)
  async reactivateFlight(flight_id: number): Promise<Flight> {
    const flight = await this.findOne(flight_id);

    if (flight.status === 'Active') {
      throw new BadRequestException(`เที่ยวบิน ${flight.flight_code} เปิดให้บริการอยู่แล้ว`);
    }

    flight.status = 'Active';
    const updated = await this.flightRepository.save(flight);
    
    console.log(`✅ เปิดให้บริการเที่ยวบิน ${flight.flight_code} อีกครั้ง`);
    return updated;
  }
}