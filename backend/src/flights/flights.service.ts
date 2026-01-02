import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Flight } from '../entities/flight.entity';
import { CreateFlightDto } from './dto/create-flight.dto';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
  ) {}

  async findAll(
    origin?: string,
    destination?: string,
    date?: string,
  ): Promise<Flight[]> {
    const where: FindOptionsWhere<Flight> = {};

    // ถ้ามีการส่งต้นทางมา
    if (origin) {
      where.origin = origin;
    }

    // ถ้ามีการส่งปลายทางมา
    if (destination) {
      where.destination = destination;
    }

    // การค้นหาวันที่แบบครอบคลุมทั้งวัน
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.travel_date = Between(startOfDay, endOfDay);
    }

    // ✅ ตรวจสอบว่ามีเงื่อนไขการค้นหาไหม?
    const isSearching = origin || destination || date;

    return await this.flightRepository.find({
      where: where,
      // ✅ Logic การเรียงลำดับแบบอัจฉริยะ
      order: isSearching
        ? { travel_date: 'ASC' }  // ถ้าลูกค้าค้นหา: เรียงตามเวลาเดินทาง (จะได้เจอเที่ยวบินเร็วสุดก่อน)
        : { flight_id: 'DESC' },  // ถ้าแอดมินดูรายการเฉยๆ: เรียงตาม ID ใหม่ล่าสุด (จะได้เห็นที่เพิ่งเพิ่มทันที)
    });
  }

  async findOne(flight_id: number): Promise<Flight> {
    const flight = await this.flightRepository.findOne({
      where: { flight_id },
    });
    if (!flight) {
      throw new NotFoundException(`ไม่พบเที่ยวบินรหัส ${flight_id}`);
    }
    return flight;
  }

  async create(dto: CreateFlightDto): Promise<Flight> {
    const flight = this.flightRepository.create({
      flight_code: dto.flight_code,
      origin: dto.origin,
      destination: dto.destination,
      travel_date: new Date(dto.travelDate),
      price: dto.price,
      available_seats: dto.availableSeats,
      status: 'Active',
    });

    return await this.flightRepository.save(flight);
  }

  async update(
    flight_id: number,
    updateData: Partial<Flight>,
  ): Promise<Flight> {
    const flight = await this.findOne(flight_id);
    Object.assign(flight, updateData);
    return await this.flightRepository.save(flight);
  }

  async remove(flight_id: number): Promise<void> {
    const result = await this.flightRepository.delete(flight_id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `ไม่สามารถลบได้ เนื่องจากไม่พบรหัส ${flight_id}`,
      );
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