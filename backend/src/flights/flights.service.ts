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

  // ✅ แก้ไขปัญหา null value ใน column "flight_code"
  async create(dto: CreateFlightDto): Promise<Flight> {
    const flight = this.flightRepository.create({
      flight_code: dto.flight_code,           // ✅ ใส่ค่าจาก Postman ลงใน Database
      origin: dto.origin,
      destination: dto.destination,
      travel_date: new Date(dto.travelDate), // ✅ แปลง travelDate เป็น travel_date ของ DB
      price: dto.price,
      available_seats: dto.availableSeats,   // ✅ แปลง availableSeats เป็น available_seats ของ DB
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