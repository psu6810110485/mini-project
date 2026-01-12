// backend/src/flights/flights.controller.ts

// ===============================
// Import หลักจาก NestJS
// ===============================
import { 
  Controller, // พนักงานรับออเดอร์
  Get, // ดึงข้อมูลจาก Server
  Post, // ส่งข้อมูลไปสร้าง Resource ใหม่ใน Server
  Patch, // แก้ไขข้อมูลบางส่วนของ Resource
  Delete, // ลบ Resource จาก Server
  Body,  // ดึง ข้อมูลจาก body ของ HTTP request
  Param, // ดึง ค่าจาก URL parameter
  UseGuards, //ใช้กำหนด Guard สำหรับตรวจสอบสิทธิ์ / Authentication / Authorization
  ParseIntPipe // Pipe สำหรับ แปลงค่าจาก string เป็น number
} from '@nestjs/common';

// Import Service ของ Flights (Business Logic คือ กระบวนการหลักของแอป )
import { FlightsService } from './flights.service';

// Import Guard สำหรับ JWT และ Roles
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // นำเข้า JWT Guard
                                                      // ใช้ตรวจสอบว่า ผู้ใช้มี Token ถูกต้อง ก่อนเข้าถึง API                                                 
import { RolesGuard } from '../auth/roles.guard'; //นำเข้า Roles Guard
                                                  // ใช้ตรวจสอบว่า ผู้ใช้มีสิทธิ์ (Role) ที่อนุญาต ก่อนทำงานบาง API เช่น Admin เท่านั้น

// Import Decorator สำหรับ Roles
import { Roles } from '../auth/roles.decorator'; //นำเข้า Decorator @Roles
                                                //ใช้กำหนดว่า API นี้ใครสามารถเข้าถึงได้ เช่น 'ADMIN'

// Import Entity Flight
import { Flight } from '../entities/flight.entity'; //นำเข้า Entity Flight
                                                    //ใช้เป็นโครงสร้างข้อมูลเที่ยวบิน เชื่อมกับ Database

// Import Swagger
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger'; 
//นำเข้า Swagger Tools
//ApiTags → แบ่งหมวด API
//ApiTags → แบ่งหมวด API
//ApiBearerAuth → แสดงปุ่มใส่ Token ใน Swagger UI

// Import DTO สำหรับสร้างเที่ยวบิน
import { CreateFlightDto } from './dto/create-flight.dto';

// ===============================
// Controller
// ===============================

// ตั้งชื่อหมวดใน Swagger
@ApiTags('Flights')

// แสดงปุ่ม Authorization ใน Swagger
@ApiBearerAuth()

// URL หลักของ Controller นี้คือ /flights
@Controller('flights') // กำหนดว่า URL หลักของ Controller นี้คือ /flights
export class FlightsController {
  constructor(private flightsService: FlightsService) {}

  // ===============================
  // ดึงเที่ยวบินทั้งหมด
  // GET /flights
  // ===============================
  @Get()
  async getAll(): Promise<Flight[]> {
    // เรียก Service เพื่อดึงข้อมูลทั้งหมด
    return await this.flightsService.findAll(); //เรียก Service มาช่วยจัดการข้อมูลแล้วส่งผลลัพธ์กลับไปยังผู้ใช้งานครับ
  }

  // ===============================
  // ดึงเที่ยวบินเดียวตาม id
  // GET /flights/:id
  // ===============================
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    // ParseIntPipe แปลง param เป็น number
    return await this.flightsService.findOne(id); //เรียก Service มาช่วยจัดการข้อมูลแล้วส่งผลลัพธ์กลับไปยังผู้ใช้งานครับ
  }

  // ===============================
  // สร้างเที่ยวบินใหม่ (Admin เท่านั้น)
  // POST /flights
  // ===============================
  @Post()
  @ApiBody({ type: CreateFlightDto })                // บอก Swagger ว่า Body ใช้ DTO ไหน
  @UseGuards(JwtAuthGuard, RolesGuard)              // ต้อง login + ตรวจสอบ Roles
  @Roles('ADMIN', 'admin')                           // จำกัดเฉพาะ Admin
  async create(@Body() flightData: CreateFlightDto): Promise<Flight> {
    return await this.flightsService.create(flightData);
  }

  // ===============================
  // แก้ไขเที่ยวบิน (Admin เท่านั้น)
  // PATCH /flights/:id
  // ===============================
  @Patch(':id')
  @ApiBody({ type: CreateFlightDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any
  ): Promise<Flight> {
    return await this.flightsService.update(id, updateData); //เรียก Service มาช่วยจัดการข้อมูลแล้วส่งผลลัพธ์กลับไปยังผู้ใช้งานครับ
  }

  // ===============================
  // ลบเที่ยวบิน (Admin เท่านั้น)
  // DELETE /flights/:id
  // ===============================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.flightsService.remove(id); //เรียก Service มาช่วยจัดการข้อมูลแล้วส่งผลลัพธ์กลับไปยังผู้ใช้งานครับ
  }

  // ===============================
  // ยกเลิกเที่ยวบิน (เปลี่ยน Status → Cancelled)
  // PATCH /flights/:id/cancel
  // ===============================
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async cancelFlight(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return await this.flightsService.cancelFlight(id);
  }

  // ===============================
  // เปิดเที่ยวบินใหม่ (เปลี่ยน Status → Active)
  // PATCH /flights/:id/reactivate
  // ===============================
  @Patch(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'admin')
  async reactivateFlight(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    return await this.flightsService.reactivateFlight(id);
  }
}

/*
===============================
คำอธิบายหลักของไฟล์นี้ (FlightsController)
===============================

1️⃣ Controller ทำหน้าที่ "รับ HTTP Request" จาก Frontend 
   → เรียก Service (Business Logic) ทำงาน
   → ส่งผลลัพธ์กลับไปให้ Client

2️⃣ @Controller('flights') 
   → URL หลัก /flights

3️⃣ Swagger Decorator:
   - @ApiTags('Flights') = แบ่งหมวดหมู่ใน Swagger
   - @ApiBody({ type: CreateFlightDto }) = บอก Swagger ว่า Body ใช้ DTO
   - @ApiBearerAuth() = แสดงปุ่ม Authorization สำหรับ Token

4️⃣ Guards & Roles:
   - @UseGuards(JwtAuthGuard, RolesGuard) = ต้อง login + ตรวจสอบสิทธิ์
   - @Roles('ADMIN') = จำกัดเฉพาะ Admin
   → ทำให้ Admin เท่านั้นสร้าง/แก้ไข/ลบ/ยกเลิกเที่ยวบินได้

5️⃣ ParseIntPipe:
   → แปลง param จาก string → number (เช่น /flights/3)

6️⃣ ฟังก์ชันสำคัญ:
   - getAll() → ดึงเที่ยวบินทั้งหมด
   - getOne(id) → ดึงเที่ยวบินเดียว
   - create(flightData) → สร้างเที่ยวบินใหม่
   - update(id, data) → แก้ไขเที่ยวบิน
   - remove(id) → ลบเที่ยวบิน
   - cancelFlight(id) → เปลี่ยน status → Cancelled
   - reactivateFlight(id) → เปลี่ยน status → Active

✅ Type Safety + Roles + Guard = ป้องกันผู้ใช้ไม่พึงประสงค์ และลดข้อผิดพลาด
*/
