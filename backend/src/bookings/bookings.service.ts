import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { Flight } from '../entities/flight.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private dataSource: DataSource,
  ) {}

  async create(userId: number, flightId: number, numSeats: number, totalPrice: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const flight = await queryRunner.manager.findOne(Flight, {
        where: { flight_id: flightId },
      });

      if (!flight) {
        throw new NotFoundException('ไม่พบเที่ยวบินที่ระบุ');
      }

      if (flight.available_seats < numSeats) {
        throw new BadRequestException(`ที่นั่งไม่พอ (เหลือ: ${flight.available_seats})`);
      }

      flight.available_seats -= numSeats;
      await queryRunner.manager.save(flight);

      const booking = queryRunner.manager.create(Booking, {
        user_id: userId,
        flight_id: flightId,
        seat_count: numSeats,
        total_price: totalPrice,
        status: 'Confirmed',
        booking_time: new Date(),
      });

      const savedBooking = await queryRunner.manager.save(booking);
      await queryRunner.commitTransaction();
      
      return savedBooking;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ Method ใหม่: ดึงประวัติการจองพร้อมข้อมูลเที่ยวบิน
  async findByUserId(userId: number) {
    return await this.bookingRepository.find({
      where: { user_id: userId },
      relations: ['flight'], // ✅ ดึงข้อมูล Flight มาด้วย (ต้องมี @ManyToOne ใน Entity)
      order: { booking_time: 'DESC' }, // เรียงจากใหม่ไปเก่า
    });
  }
}