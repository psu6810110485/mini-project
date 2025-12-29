import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Flight } from '../entities/flight.entity';

@Controller('flights')
export class FlightsController {
  constructor(private flightsService: FlightsService) {}

  // 1. ดูเที่ยวบินทั้งหมด (ใครก็ดูได้)
  @Get()
  async getAll(): Promise<Flight[]> { // ระบุเป็น Promise<Flight[]> เพื่อแก้ Error ในรูป
    return await this.flightsService.findAll();
  }

  // 2. ดูเที่ยวบินทีละอัน (ระบุ id ใน URL)
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return await this.flightsService.findOne(id);
  }

  // 3. สร้างเที่ยวบินใหม่ (เฉพาะ ADMIN เท่านั้น)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() flightData: any): Promise<Flight> {
    return await this.flightsService.create(flightData);
  }

  // 4. แก้ไขข้อมูลเที่ยวบิน (เฉพาะ ADMIN เท่านั้น)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any): Promise<Flight> {
    return await this.flightsService.update(id, updateData);
  }

  // 5. ลบเที่ยวบิน (เฉพาะ ADMIN เท่านั้น)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.flightsService.remove(id);
  }
}