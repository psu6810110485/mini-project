import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Flight } from '../entities/flight.entity';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger'; 
import { CreateFlightDto } from './dto/create-flight.dto'; // ✅ นำเข้าจากไฟล์ที่คุณสร้าง

@ApiTags('Flights')
@ApiBearerAuth()
@Controller('flights')
export class FlightsController {
  constructor(private flightsService: FlightsService) {}

  @Get()
  async getAll(): Promise<Flight[]> {
    return await this.flightsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return await this.flightsService.findOne(id);
  }

  @Post()
  @ApiBody({ type: CreateFlightDto }) 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() flightData: CreateFlightDto): Promise<Flight> {
    // ✅ ส่งข้อมูลไปยัง Service เพื่อบันทึกลงฐานข้อมูล
    return await this.flightsService.create(flightData);
  }

  @Patch(':id')
  @ApiBody({ type: CreateFlightDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any): Promise<Flight> {
    return await this.flightsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.flightsService.remove(id);
  }
}