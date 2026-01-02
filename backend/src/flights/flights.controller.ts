import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common'; // ✅ 1. เพิ่ม Query ที่นี่
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Flight } from '../entities/flight.entity';
import { ApiTags, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'; // (Optional) เพิ่ม ApiQuery ถ้าอยากให้โชว์ใน Swagger
import { CreateFlightDto } from './dto/create-flight.dto';

@ApiTags('Flights')
@ApiBearerAuth()
@Controller('flights')
export class FlightsController {
  constructor(private flightsService: FlightsService) {}

  // ✅ 2. อัปเดตเมนู Get All ให้รับค่า Search
  @Get()
  // (Optional) บรรทัด ApiQuery เหล่านี้ช่วยให้มีช่องกรอกใน Swagger (ถ้าไม่ใช้ Swagger ลบออกได้)
  @ApiQuery({
    name: 'origin',
    required: false,
    description: 'ต้นทาง (เช่น BKK)',
  })
  @ApiQuery({
    name: 'destination',
    required: false,
    description: 'ปลายทาง (เช่น CNX)',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'วันที่เดินทาง (YYYY-MM-DD)',
  })
  async getAll(
    @Query('origin') origin?: string, // รับค่า ?origin=...
    @Query('destination') destination?: string, // รับค่า ?destination=...
    @Query('date') date?: string, // รับค่า ?date=...
  ): Promise<Flight[]> {
    // ส่งค่าทั้งหมดไปให้ Service ประมวลผล
    return await this.flightsService.findAll(origin, destination, date);
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
    return await this.flightsService.create(flightData);
  }

  @Patch(':id')
  @ApiBody({ type: CreateFlightDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any,
  ): Promise<Flight> {
    return await this.flightsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.flightsService.remove(id);
  }
}
