import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // นำเข้า JwtAuthGuard
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Flight } from '../entities/flight.entity';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger'; 
import { CreateFlightDto } from './dto/create-flight.dto';

@ApiTags('Flights') //ป้ายหมวดหมู่ใน Swagger UI
@ApiBearerAuth() // บอก Swagger ว่าต้องใช้ Bearer Token (JWT)
@Controller('flights') // กำหนดเส้นทางหลักเป็น /flights

export class FlightsController { 
  constructor(private flightsService: FlightsService) {} //การจ้าง FlightsService มาใช้ใน Controller นี้

  @Get()
  async getAll(): Promise<Flight[]> {
    return await this.flightsService.findAll();
  }

  @Get(':id') // ดึงเที่ยวบินตามรหัส ID แทนที่จะมาใส่เลขไอดีทีละตัว ใน URL
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> { // ใช้ ParseIntPipe แปลง id จาก string เป็น number อัตโนมัติ
    return await this.flightsService.findOne(id);
  }

  @Post() // สร้างเที่ยวบินใหม่ โซนของ Admin มีการแก้ไขข้อมูล
  @ApiBody({ type: CreateFlightDto }) 
  @UseGuards(JwtAuthGuard, RolesGuard) //มีการใช้ Guards เพื่อตรวจสอบการเข้าถึง RolesGuard ตรวจสอบบทบาทผู้ใช้
  // ✅ แก้ไข: เพิ่ม 'admin' ตัวเล็กเข้าไปด้วย กันพลาด
  @Roles('ADMIN', 'admin') 
  async create(@Body() flightData: CreateFlightDto): Promise<Flight> {
    return await this.flightsService.create(flightData);
  }

  @Patch(':id')
  @ApiBody({ type: CreateFlightDto }) //ตัวนี้จะไปเสก "แบบฟอร์มตัวอย่าง" บนหน้าเว็บ Swagger ให้เห็นว่าควรใส่อะไร
  @UseGuards(JwtAuthGuard, RolesGuard)
  // ✅ แก้ไข: เพิ่ม 'admin' ตัวเล็ก
  @Roles('ADMIN', 'admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any): Promise<Flight> {
    return await this.flightsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // ✅ แก้ไข: เพิ่ม 'admin' ตัวเล็ก
  @Roles('ADMIN', 'admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.flightsService.remove(id);
  }
}