import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { FlightsService } from '../flights/flights.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private flightsService: FlightsService,
  ) {}

  async create(userId: number, flightId: number, numSeats: number) {
    // ตัดที่นั่งตามเงื่อนไข Business Logic
    await this.flightsService.decrementSeats(flightId, numSeats);

    const booking = this.bookingRepository.create({
      user: { id: userId } as any,
      flight: { flight_id: flightId } as any,
      booking_date: new Date(),
    } as any);

    return await this.bookingRepository.save(booking);
  }
}