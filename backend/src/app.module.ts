import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
 //ล่ามแปลภาษาสำหรับ .env มันจะช่วยอ่านค่า DB_PASSWORD, PORT จากไฟล์ .env แล้วส่งต่อให้โค้ดส่วนอื่นใช้งาน
import { TypeOrmModule } from '@nestjs/typeorm'; // ตัวเชื่อมต่อฐานข้อมูล

import { AuthModule } from './auth/auth.module';  // แผนกรักษาความปลอดภัย
import { FlightsModule } from './flights/flights.module';// แผนกจัดการเที่ยวบิน
import { BookingsModule } from './bookings/bookings.module';// แผนกจัดการการจอง

  @Module({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env', // กำหนดให้ไปอ่านไฟล์ .env ที่จะใช้
        isGlobal: true, // ทำให้ ConfigModule ใช้ได้ทั่วทั้งแอป
      }),

    TypeOrmModule.forRootAsync({ // รอให้โหลดการตั้งค่า (Config) เสร็จก่อน แล้วค่อยต่อ Database
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => { // ฟังก์ชันสร้างการตั้งค่า DB
        // 🔒 ค่าที่คุณใช้จริง (ตามของเก่า)
        const host = '127.0.0.1';
        const port = 5444;
        const username = 'admin';
        const password = 'newpassword999';
        const database = 'flight_booking_db';

        // 🐛 DEBUG ช่วยเช็คการเชื่อมต่อ
        console.log('--- DEBUG: TRYING TO CONNECT ---');
        console.log(`Target: ${host}:${port}`);
        console.log(`User: ${username} / Pass: ${password}`);
        console.log(`Database: ${database}`);
        console.log('--------------------------------');

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'], //หา .entity.ts ถ้าเจอให้เหมารวมว่าเป็นตารางใน DB
          synchronize: true, // ⚠️ ปิดใน production // ให้ TypeORM จัดการสร้างตารางให้ตรงกับ Entitys อัตโนมัติ
          logging: false,
          
          // 🚀 เพิ่มส่วนนี้เพื่อแก้ปัญหาถาวร
          autoLoadEntities: true,
          retryAttempts: 10,           // ลองเชื่อมต่อใหม่ 10 ครั้ง
          retryDelay: 3000,            // รอ 3 วินาทีต่อครั้ง
          connectTimeoutMS: 10000,     // timeout 10 วินาที
          maxQueryExecutionTime: 5000, // query ไม่เกิน 5 วินาที
        };
      },
    }),

    AuthModule,
    FlightsModule,
    BookingsModule,
  ], //เอา 3 แผนกนี้ เข้ามารวมร่างในแอปหลักเรียบร้อยแล้ว ถ้าลืมใส่ตรงนี้ Route ต่างๆ ที่เราเขียนไว้ (เช่น /flights, /login) จะใช้งานไม่ได้เลย
})
export class AppModule {}