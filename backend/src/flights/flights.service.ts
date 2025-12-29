import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from '../entities/flight.entity';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
  ) {}

  async findAll(): Promise<Flight[]> {
    return await this.flightRepository.find();
  }

  // จุดที่ 1: ตรวจสอบว่ามีบรรทัดดึงข้อมูลจาก DB หรือยัง (ในรูปก่อนหน้าคุณลืมบรรทัดนี้ครับ)
  async findOne(flight_id: number): Promise<Flight> {
    const flight = await this.flightRepository.findOne({ where: { flight_id } });
    if (!flight) {
      throw new NotFoundException(`ไม่พบเที่ยวบินรหัส ${flight_id}`);
    }
    return flight;
  }

  // จุดที่ 2: แก้ตัวแดงที่บรรทัด 32 (จุดเจ้าปัญหา)
  async create(flightData: Partial<Flight>): Promise<Flight> {
    // เราใช้ as Flight เพื่อบอก TypeScript ว่าข้อมูลนี้คือชิ้นเดียวแน่ๆ
    const flight = this.flightRepository.create(flightData) as Flight; 
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

  // Business Logic: ตัดที่นั่งว่างตามโจทย์
  async decrementSeats(flight_id: number, count: number): Promise<void> {
    const flight = await this.findOne(flight_id); 
    if (flight.available_seats < count) {
      throw new BadRequestException('ขออภัย จำนวนที่นั่งว่างไม่เพียงพอ');
    }
    flight.available_seats -= count; 
    await this.flightRepository.save(flight);
  }
}