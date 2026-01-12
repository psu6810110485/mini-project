// backend/src/bookings/bookings.service.ts

// ===============================
// Import หลักจาก NestJS + TypeORM  --- NestJS → Framework สำหรับสร้าง Backend / API
//                                 --- TypeORM → Library สำหรับ ติดต่อฐานข้อมูล (ORM)
// ===============================
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, OptimisticLockVersionMismatchError } from 'typeorm';

// Import Entity
import { Booking } from '../entities/booking.entity';
import { Flight } from '../entities/flight.entity';

// ===============================
// Service
// ===============================
@Injectable()
export class BookingsService {
  constructor(
    // Inject Repository ของ Booking
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    // Inject Repository ของ Flight
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,

    // Inject DataSource สำหรับ Transaction
    private dataSource: DataSource,
  ) {}

  // ===============================
  // สร้างการจอง (Transaction + Concurrency Control)
  // ===============================
  async create(userId: number, flightId: number, numSeats: number, totalPrice: number) {
    // สร้าง QueryRunner สำหรับ Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️⃣ ดึงข้อมูลเที่ยวบิน
      const flight = await queryRunner.manager.findOne(Flight, {
        where: { flight_id: flightId },
      });
      if (!flight) throw new NotFoundException('ไม่พบเที่ยวบินที่ระบุ');

      // 2️⃣ ตรวจสอบที่นั่งว่าง
      if (flight.available_seats < numSeats) {
        throw new BadRequestException(`ที่นั่งไม่พอ (เหลือ: ${flight.available_seats})`);
      }

      // 3️⃣ ตัดที่นั่ง
      flight.available_seats -= numSeats;

      // ✅ TypeORM จะเช็ค Version Column ให้อัตโนมัติ
      // ถ้ามีคนอื่นจองตัดหน้า → เกิด OptimisticLockVersionMismatchError
      await queryRunner.manager.save(flight);

      // 4️⃣ สร้าง Record การจอง
      const booking = queryRunner.manager.create(Booking, {
        user_id: userId,
        flight_id: flightId,
        seat_count: numSeats,
        total_price: totalPrice,
        status: 'Confirmed',
        booking_time: new Date(),
      });

      const savedBooking = await queryRunner.manager.save(booking);

      // 5️⃣ ยืนยัน Transaction
      await queryRunner.commitTransaction();

      return savedBooking;

    } catch (err) {
      // เกิดข้อผิดพลาด → rollback transaction
      await queryRunner.rollbackTransaction();

      // ✅ ดักจับ Error กรณีจองชนกัน (Concurrency Control)
      if (err instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException('ขออภัย! มีผู้ใช้งานอื่นจองที่นั่งตัดหน้า กรุณาลองใหม่อีกครั้ง');
      }

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ===============================
  // ดึงประวัติการจองตาม userId
  // ===============================
  async findByUserId(userId: number) {
    try {
      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.flight', 'flight')
        .where('booking.user_id = :userId', { userId })
        .orderBy('booking.booking_time', 'DESC')
        .getMany();

      return bookings.map(booking => ({
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        flight_id: booking.flight_id,
        seat_count: booking.seat_count,
        total_price: Number(booking.total_price),
        status: booking.status.toLowerCase(),
        booking_time: booking.booking_time,
        flight: booking.flight ? {
          flight_code: booking.flight.flight_code,
          origin: booking.flight.origin,
          destination: booking.flight.destination,
          travel_date: booking.flight.travel_date
        } : null
      }));
    } catch (error) {
      throw new BadRequestException('ไม่สามารถดึงข้อมูลการจองได้');
    }
  }

  // ===============================
  // อัพเดตสถานะการจอง / ยกเลิกการจอง
  // ===============================
  async updateStatus(bookingId: number, status: string) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: bookingId },
      relations: ['flight']
    });

    if (!booking) throw new NotFoundException('ไม่พบการจองที่ระบุ');

    // ถ้ายกเลิกซ้ำ → error
    if (status.toLowerCase() === 'cancelled' && booking.status.toLowerCase() === 'cancelled') {
      throw new BadRequestException('การจองนี้ถูกยกเลิกไปแล้ว');
    }

    // คืนที่นั่งเมื่อยกเลิก
    if (status.toLowerCase() === 'cancelled' && booking.status.toLowerCase() !== 'cancelled') {
      const flight = await this.flightRepository.findOne({ where: { flight_id: booking.flight_id } });
      if (flight) {
        flight.available_seats += booking.seat_count;
        await this.flightRepository.save(flight);
      }
    }

    booking.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const updated = await this.bookingRepository.save(booking);

    return {
      ...updated,
      status: updated.status.toLowerCase()
    };
  }
}

/*
===============================
คำอธิบายหลักของ BookingsService
===============================

1️⃣ Transaction & QueryRunner:
   - สร้างการจองต้องทำ Transaction
   - ป้องกันกรณีหลายคนจองพร้อมกัน
   - commit → บันทึกจริง, rollback → ยกเลิกทั้งหมด

2️⃣ Concurrency / Locking:
   - ใช้ Version Column ใน Flight
   - ถ้ามีคนอื่นจองตัดหน้า → OptimisticLockVersionMismatchError
   - ดัก Error นี้ → แจ้งผู้ใช้ลองใหม่

3️⃣ ฟังก์ชันหลัก:
   - create(userId, flightId, numSeats, totalPrice)
     → สร้างการจอง พร้อมลดที่นั่ง และ Concurrency Control
   - findByUserId(userId)
     → ดึงประวัติการจอง + ข้อมูลเที่ยวบิน
   - updateStatus(bookingId, status)
     → เปลี่ยนสถานะ / คืนที่นั่งเมื่อยกเลิก

4️⃣ Exception Handling:
   - NotFoundException → ไม่พบ Flight หรือ Booking
   - BadRequestException → ที่นั่งไม่พอ, ยกเลิกซ้ำ
   - ConflictException → จองชนกัน (Concurrency)
*/
