import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from '../entities/flight.entity';
import { CreateFlightDto } from './dto/create-flight.dto'; // ✅ นำเข้า DTO

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

  // ✅ แก้ไข: จับคู่ตัวแปรจาก DTO (CamelCase) ไปยัง Database (Snake_case) ให้ถูกต้อง
  async create(dto: CreateFlightDto): Promise<Flight> {
    const flight = this.flightRepository.create({
      // ฝั่งซ้าย = ชื่อ Column ใน Database (Snake_case)
      // ฝั่งขวา = ชื่อตัวแปรที่รับมาจาก DTO (CamelCase)
      
      flight_code: dto.flightCode,          // 👈 แก้จาก dto.flight_code เป็น dto.flightCode
      origin: dto.origin,
      destination: dto.destination,
      
      // หมายเหตุ: ถ้า DTO ส่งมาเป็น String ให้ใช้ new Date()
      // ถ้าส่งมาเป็น Date อยู่แล้วก็ใช้ dto.travelDate ได้เลย
      travel_date: new Date(dto.travelDate), // 👈 แก้จาก dto.travel_date เป็น dto.travelDate
      
      price: dto.price,
      available_seats: dto.availableSeats,   // 👈 แก้จาก dto.available_seats เป็น dto.availableSeats
      
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

  async decrementSeats(flight_id: number, count: number): Promise<void> {
    const flight = await this.findOne(flight_id); 
    if (flight.available_seats < count) {
      throw new BadRequestException('ขออภัย จำนวนที่นั่งว่างไม่เพียงพอ');
    }
    flight.available_seats -= count; 
    await this.flightRepository.save(flight);
  }
}