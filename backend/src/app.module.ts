// backend/src/app.module.ts
// ===============================
// AppModule = ศูนย์รวม (Main Hub) ของระบบ NestJS
// ===============================

// นำเข้า Module decorator
// ใช้บอก NestJS ว่าไฟล์นี้คือ Module
import { Module } from '@nestjs/common';

// ConfigModule ใช้โหลดไฟล์ .env
// ConfigService ใช้ดึงค่าจาก process.env
import { ConfigModule, ConfigService } from '@nestjs/config';

// TypeOrmModule ใช้เชื่อมต่อ NestJS กับ Database (PostgreSQL)
import { TypeOrmModule } from '@nestjs/typeorm';

// Import Module ย่อยของระบบ
import { AuthModule } from './auth/auth.module';        // ระบบ Login / JWT
import { FlightsModule } from './flights/flights.module'; // ระบบจัดการเที่ยวบิน
import { BookingsModule } from './bookings/bookings.module'; // ระบบจองตั๋ว

// ===============================
// Import Entity (ตารางใน Database)
// ===============================

// ตารางผู้ใช้งาน
import { User } from './entities/user.entity';

// ตารางเที่ยวบิน
import { Flight } from './entities/flight.entity';

// ตารางการจอง
import { Booking } from './entities/booking.entity';

// ตารางสิ่งอำนวยความสะดวกของเที่ยวบิน
import { FlightAmenity } from './entities/flight-amenity.entity';

// ===============================
// กำหนด AppModule
// ===============================
@Module({
  imports: [

    // -------------------------------
    // โหลด Environment Variables (.env)
    // -------------------------------
    ConfigModule.forRoot({
      envFilePath: '.env',   // ระบุไฟล์ .env
      isGlobal: true,        // ใช้ได้ทุก Module โดยไม่ต้อง import ซ้ำ
    }),

    // -------------------------------
    // ตั้งค่าเชื่อมต่อ Database แบบ Async
    // -------------------------------
    TypeOrmModule.forRootAsync({

      // บอกว่าใช้ ConfigModule
      imports: [ConfigModule],

      // Inject ConfigService เข้ามาใช้
      inject: [ConfigService],

      // Factory Function ใช้สร้าง config ของ TypeORM
      useFactory: async (configService: ConfigService) => {

        // -------------------------------
        // กำหนดค่าการเชื่อมต่อ Database
        // -------------------------------
        const host = '127.0.0.1';              // ที่อยู่ Database
        const port = 5444;                     // Port ของ PostgreSQL
        const username = 'admin';              // Username
        const password = 'newpassword999';     // Password
        const database = 'flight_booking_db';  // ชื่อ Database

        // -------------------------------
        // แสดง Log สำหรับ Debug การเชื่อมต่อ
        // -------------------------------
        console.log('--- DEBUG: TRYING TO CONNECT ---');
        console.log(`Target: ${host}:${port}`);
        console.log(`User: ${username} / Pass: ${password}`);
        console.log(`Database: ${database}`);
        console.log('--------------------------------');

        // -------------------------------
        // ส่งค่าการตั้งค่าให้ TypeORM
        // -------------------------------
        return {
          type: 'postgres', // ใช้ PostgreSQL
          host,
          port,
          username,
          password,
          database,

          // ระบุ Entity ที่ใช้ในระบบ (แทนการใช้ pattern)
          entities: [
            User,
            Flight,
            Booking,
            FlightAmenity,
          ],

          // สร้าง / อัปเดตตารางอัตโนมัติ (เหมาะกับ DEV)
          synchronize: true,

          // ปิด log query
          logging: false,

          // โหลด Entity อัตโนมัติจาก Module อื่น
          autoLoadEntities: true,

          // ถ้าเชื่อมต่อไม่ติด ให้ลองใหม่กี่ครั้ง
          retryAttempts: 10,

          // หน่วงเวลาก่อน retry (ms)
          retryDelay: 3000,

          // Timeout การเชื่อมต่อ
          connectTimeoutMS: 10000,

          // เตือนถ้า query ช้ากว่าเวลาที่กำหนด
          maxQueryExecutionTime: 5000,
        };
      },
    }),

    // -------------------------------
    // Import Module ย่อยเข้าระบบ
    // -------------------------------
    AuthModule,       // Authentication / Authorization
    FlightsModule,    // เที่ยวบิน
    BookingsModule,   // การจอง
  ],
})
export class AppModule {}
