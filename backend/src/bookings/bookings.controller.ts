import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: any, 
    @Body() body: { flightId: number, seatCount: number, totalPrice: number } 
  ) {
    return await this.bookingsService.create(
      req.user.userId, 
      body.flightId, 
      body.seatCount, 
      body.totalPrice
    );
  }

  // ✅ Endpoint ใหม่: ดึงประวัติการจองของ User
  @Get('my-bookings/:userId')
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@Param('userId') userId: string) {
    return await this.bookingsService.findByUserId(Number(userId));
  }
}