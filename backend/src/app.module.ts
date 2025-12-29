import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Flight } from './entities/flight.entity';
import { Booking } from './entities/booking.entity';

// Import Module อื่นๆ เพิ่มเติม
import { AuthModule } from './auth/auth.module'; // เพิ่มบรรทัดนี้
import { FlightsModule } from './flights/flights.module';
import { BookingsModule } from './bookings/bookings.module'; // เพิ่มบรรทัดนี้

@Module({
  imports: [
    // 1. โหลดไฟล์ .env มาใช้งาน
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 2. เชื่อมต่อ Database โดยดึงค่าจาก .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Flight, Booking],
        synchronize: true, // สร้างตารางให้อัตโนมัติ
      }),
    }),
    // 3. ลงทะเบียนโมดูลการทำงานทั้งหมด
    AuthModule,      // สำหรับระบบ Login/Register
    FlightsModule,   // สำหรับจัดการเที่ยวบิน
    BookingsModule,  // สำหรับระบบจองและตัด Stock
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}