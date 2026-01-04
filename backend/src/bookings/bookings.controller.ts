import { Controller, Post, Get, Body, UseGuards, Req, Param, Patch } from '@nestjs/common';
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

  // ✅ Endpoint เดิม: ดึงประวัติการจองของ User (เก็บไว้)
  @Get('my-bookings/:userId')
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@Param('userId') userId: string) {
    return await this.bookingsService.findByUserId(Number(userId));
  }

  // ✅ Endpoint ใหม่: ดึงประวัติการจองของ User (URL ที่ Frontend เรียก)
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserBookings(@Param('userId') userId: string) {
    return await this.bookingsService.findByUserId(Number(userId));
  }

  // ✅ เพิ่มใหม่: Endpoint สำหรับยกเลิกการจอง
  @Patch(':bookingId')
  @UseGuards(JwtAuthGuard)
  async updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body() body: { status: string }
  ) {
    return await this.bookingsService.updateStatus(Number(bookingId), body.status);
  }
}