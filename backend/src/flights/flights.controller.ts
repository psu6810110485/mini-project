import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  ParseIntPipe 
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Flight } from '../entities/flight.entity';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateFlightDto } from './dto/create-flight.dto';

@ApiTags('Flights')
@ApiBearerAuth()
@Controller('flights')
export class FlightsController {
  constructor(private flightsService: FlightsService) {}

  // ✅ งานเดิม - ดึงรายการเที่ยวบินทั้งหมด
  @Get()
  async getAll(): Promise<Flight[]> {
    return await this.flightsService.findAll();
  }

  // ✅ งานเดิม - ดึงเที่ยวบินเดียว
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return await this.flightsService.findOne(id);
  }

  // ✅ งานเดิม - เพิ่มเที่ยวบิน (Admin เท่านั้น)
  @Post()
  @ApiBody({ type: CreateFlightDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async create(@Body() flightData: CreateFlightDto): Promise<Flight> {
    return await this.flightsService.create(flightData);
  }

  // ✅ งานเดิม - แก้ไขเที่ยวบิน (Admin เท่านั้น)
  @Patch(':id')
  @ApiBody({ type: CreateFlightDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any
  ): Promise<Flight> {
    return await this.flightsService.update(id, updateData);
  }

  // ✅ งานเดิม - ลบเที่ยวบิน (Admin เท่านั้น)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.flightsService.remove(id);
  }

  // 🔥 ✅ [NEW] ยกเลิกเที่ยวบิน (เปลี่ยน Status เป็น Cancelled)
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async cancelFlight(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return await this.flightsService.cancelFlight(id);
  }

  // 🔥 ✅ [NEW] เปิดเที่ยวบินใหม่ (เปลี่ยน Status เป็น Active)
  @Patch(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async reactivateFlight(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return await this.flightsService.reactivateFlight(id);
  }
}