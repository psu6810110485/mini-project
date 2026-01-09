import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common'; // ✅ เพิ่ม ConflictException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, OptimisticLockVersionMismatchError } from 'typeorm'; // ✅ เพิ่ม OptimisticLockVersionMismatchError
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

  // ------------------------------------------------------------------
  // 🟢 ฟังก์ชันสร้างการจอง (Logic หลัก + เพิ่ม Concurrency Control)
  // ------------------------------------------------------------------
  async create(userId: number, flightId: number, numSeats: number, totalPrice: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. ดึงข้อมูลเที่ยวบิน
      const flight = await queryRunner.manager.findOne(Flight, {
        where: { flight_id: flightId },
      });

      if (!flight) {
        throw new NotFoundException('ไม่พบเที่ยวบินที่ระบุ');
      }

      // 2. ตรวจสอบที่นั่งว่าง
      if (flight.available_seats < numSeats) {
        throw new BadRequestException(`ที่นั่งไม่พอ (เหลือ: ${flight.available_seats})`);
      }

      // 3. ตัดที่นั่ง
      flight.available_seats -= numSeats;

      // ✅ [CRITICAL UPDATE] บันทึกข้อมูลลง DB
      // ตรงนี้ TypeORM จะเช็ค Version Column ให้อัตโนมัติ
      // ถ้า Version ใน DB ไม่ตรงกับที่อ่านมา (มีคนอื่นแย่งจองตัดหน้า) จะเกิด Error
      await queryRunner.manager.save(flight);

      // 4. สร้าง Record การจอง
      const booking = queryRunner.manager.create(Booking, {
        user_id: userId,
        flight_id: flightId,
        seat_count: numSeats,
        total_price: totalPrice,
        status: 'Confirmed',
        booking_time: new Date(),
      });

      const savedBooking = await queryRunner.manager.save(booking);
      
      // 5. ยืนยัน Transaction
      await queryRunner.commitTransaction();
      
      return savedBooking;

    } catch (err) {
      // เกิดข้อผิดพลาด ให้ยกเลิก Transaction
      await queryRunner.rollbackTransaction();

      // ✅ [NEW] ดักจับ Error กรณีจองชนกัน (Concurrency)
      // เพื่อแจ้งเตือนผู้ใช้อย่างชัดเจน แทนที่จะขึ้น 500 Internal Server Error
      if (err instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException('ขออภัย! มีผู้ใช้งานอื่นจองที่นั่งตัดหน้า กรุณาลองใหม่อีกครั้ง');
      }

      throw err; // โยน Error อื่นๆ ตามปกติ
    } finally {
      await queryRunner.release();
    }
  }

  // ------------------------------------------------------------------
  // 🟡 ฟังก์ชันดึงประวัติการจอง (Logic เดิม - คงไว้ 100%)
  // ------------------------------------------------------------------
  async findByUserId(userId: number) {
    try {
      console.log('🔍 Fetching bookings for userId:', userId);
      
      const bookings = await this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.flight', 'flight')
        .where('booking.user_id = :userId', { userId })
        .orderBy('booking.booking_time', 'DESC')
        .getMany();

      console.log('✅ Found bookings:', bookings.length);

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
      console.error('❌ Error fetching bookings:', error);
      throw new BadRequestException('ไม่สามารถดึงข้อมูลการจองได้');
    }
  }

  // ------------------------------------------------------------------
  // 🔴 ฟังก์ชันยกเลิก/เปลี่ยนสถานะ (Logic เดิม - คงไว้ 100%)
  // ------------------------------------------------------------------
  async updateStatus(bookingId: number, status: string) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: bookingId },
      relations: ['flight']
    });

    if (!booking) {
      throw new NotFoundException('ไม่พบการจองที่ระบุ');
    }

    if (status.toLowerCase() === 'cancelled' && booking.status.toLowerCase() === 'cancelled') {
      throw new BadRequestException('การจองนี้ถูกยกเลิกไปแล้ว');
    }

    // Logic คืนที่นั่งเมื่อยกเลิก
    if (status.toLowerCase() === 'cancelled' && booking.status.toLowerCase() !== 'cancelled') {
      const flight = await this.flightRepository.findOne({
        where: { flight_id: booking.flight_id }
      });

      if (flight) {
        flight.available_seats += booking.seat_count;
        await this.flightRepository.save(flight);
        console.log(`✅ คืนที่นั่ง ${booking.seat_count} ที่นั่งให้เที่ยวบิน ${flight.flight_code}`);
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