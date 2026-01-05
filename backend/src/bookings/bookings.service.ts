import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common'; // เพิ่ม ConflictException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, OptimisticLockVersionMismatchError } from 'typeorm'; // เพิ่ม Error นี้
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
      // ดึงข้อมูล Flight (TypeORM จะดึง version มาด้วยอัตโนมัติ)
      const flight = await queryRunner.manager.findOne(Flight, {
        where: { flight_id: flightId },
      });

      if (!flight) {
        throw new NotFoundException('ไม่พบเที่ยวบินที่ระบุ');
      }

      if (flight.available_seats < numSeats) {
        throw new BadRequestException(`ที่นั่งไม่พอ (เหลือ: ${flight.available_seats})`);
      }

      // ตัดที่นั่ง
      flight.available_seats -= numSeats;
      
      // บันทึก: ถ้า version ใน db ไม่ตรงกับที่ดึงมา (มีคนอื่น save ไปก่อนหน้า) จะเกิด Error
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

      // ⭐ [เพิ่มใหม่] เช็คว่า error เกิดจากการแย่งจอง (Optimistic Lock) หรือไม่ ⭐
      if (err instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException('ขออภัย มีผู้ทำรายการตัดหน้า กรุณาลองใหม่อีกครั้ง');
      }

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ [ส่วนเดิม 100%] ดึงประวัติการจองพร้อมข้อมูลเที่ยวบิน
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

      // ✅ แปลง response ให้ตรงกับ Frontend
      return bookings.map(booking => ({
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        flight_id: booking.flight_id,
        seat_count: booking.seat_count,
        total_price: Number(booking.total_price), // แปลงเป็น number
        status: booking.status.toLowerCase(), // ✅ แปลง "Confirmed" → "confirmed"
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

  // ✅ [ส่วนเดิม 100%] อัปเดตสถานะการจอง (สำหรับยกเลิก)
  async updateStatus(bookingId: number, status: string) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: bookingId },
      relations: ['flight']
    });

    if (!booking) {
      throw new NotFoundException('ไม่พบการจองที่ระบุ');
    }

    // ✅ ป้องกันการยกเลิกซ้ำ
    if (status.toLowerCase() === 'cancelled' && booking.status.toLowerCase() === 'cancelled') {
      throw new BadRequestException('การจองนี้ถูกยกเลิกไปแล้ว');
    }

    // ✅ คืนที่นั่งกลับไป
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

    booking.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(); // Capitalize
    const updated = await this.bookingRepository.save(booking);
    
    return {
      ...updated,
      status: updated.status.toLowerCase() // ส่งกลับเป็น lowercase
    };
  }
}