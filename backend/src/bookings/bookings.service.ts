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
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
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

  // ✅ Method ปรับปรุงใหม่: ดึงประวัติการจองพร้อมข้อมูลเที่ยวบิน
  async findByUserId(userId: number) {
    try {
      // ใช้ QueryBuilder แทน relations เพื่อความแม่นยำ
      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.flight', 'flight')
        .where('booking.user_id = :userId', { userId })
        .orderBy('booking.booking_time', 'DESC')
        .getMany();

      // ✅ แปลง response ให้ตรงกับ Frontend (lowercase status)
      return bookings.map(booking => ({
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        flight_id: booking.flight_id,
        seat_count: booking.seat_count,
        total_price: booking.total_price,
        status: booking.status.toLowerCase(), // แปลง "Confirmed" → "confirmed"
        booking_time: booking.booking_time,
        flight: booking.flight ? {
          flight_code: booking.flight.flight_code,
          origin: booking.flight.origin,
          destination: booking.flight.destination,
          travel_date: booking.flight.travel_date
        } : undefined
      }));
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      throw new BadRequestException('ไม่สามารถดึงข้อมูลการจองได้');
    }
  }

  // ✅ Method ใหม่: อัปเดตสถานะการจอง (สำหรับยกเลิก)
  async updateStatus(bookingId: number, status: string) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: bookingId }
    });

    if (!booking) {
      throw new NotFoundException('ไม่พบการจองที่ระบุ');
    }

    // ถ้ายกเลิกการจอง ให้คืนที่นั่งกลับไป
    if (status.toLowerCase() === 'cancelled' && booking.status.toLowerCase() !== 'cancelled') {
      const flight = await this.flightRepository.findOne({
        where: { flight_id: booking.flight_id }
      });

      if (flight) {
        flight.available_seats += booking.seat_count;
        await this.flightRepository.save(flight);
      }
    }

    booking.status = status;
    return await this.bookingRepository.save(booking);
  }
}