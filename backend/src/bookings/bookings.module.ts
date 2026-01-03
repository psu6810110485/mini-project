import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from '../entities/booking.entity';
import { Flight } from '../entities/flight.entity'; // ✅ เพิ่มบรรทัดนี้

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Flight]), // ✅ เพิ่ม Flight
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}