import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { FlightsModule } from './flights/flights.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
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
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true, // ⚠️ ปิดใน production
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
  ],
})
export class AppModule {}