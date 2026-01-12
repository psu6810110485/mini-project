import { Controller, Post, Get, Body, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // ✅ Endpoint: สร้างการจองใหม่
  @Post()
  @UseGuards(JwtAuthGuard) // ใช้ JWT Auth Guard เพื่อป้องกันการเข้าถึง
  @ApiBearerAuth()
  async create( 
    @Req() req: any, 
    @Body() body: { flightId: number, seatCount: number, totalPrice: number } 
  ) {
    console.log('📝 Creating booking for user:', req.user.userId);
    
    return await this.bookingsService.create(  // ใช้ req.user.userId แทนการรับ userId จาก body
      req.user.userId, 
      body.flightId, 
      body.seatCount, 
      body.totalPrice
    );
  }

  // ✅ Endpoint เดิม: ดึงประวัติการจองของ User (เก็บไว้เผื่อใช้งาน)
  @Get('my-bookings/:userId') //
  @UseGuards(JwtAuthGuard) // ใช้ JWT Auth Guard เพื่อป้องกันการเข้าถึง
  @ApiBearerAuth()
  async getMyBookings(@Param('userId') userId: string, @Req() req: any) {
    console.log('🔍 Fetching bookings for userId:', userId);
    console.log('👤 Authenticated user:', req.user);
    
    return await this.bookingsService.findByUserId(Number(userId));
  }

  // ✅ Endpoint ใหม่: ดึงประวัติการจองของ User (URL ที่ Frontend เรียก)
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserBookings(@Param('userId') userId: string, @Req() req: any) {
    console.log('🔍 [GET /user/:userId] Fetching bookings for userId:', userId);
    console.log('👤 Authenticated user:', req.user);
    
    return await this.bookingsService.findByUserId(Number(userId));
  }

  // ✅ Endpoint: ยกเลิกการจอง
  @Patch(':bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body() body: { status: string },
    @Req() req: any
  ) {
    console.log('🔄 Updating booking status:', { bookingId, status: body.status });
    console.log('👤 Authenticated user:', req.user);
    
    return await this.bookingsService.updateStatus(Number(bookingId), body.status);
  }
}