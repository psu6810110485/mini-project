import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Flight } from './entities/flight.entity';
import { Booking } from './entities/booking.entity';

// Import Module อื่นๆ
import { AuthModule } from './auth/auth.module';
import { FlightsModule } from './flights/flights.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    // 1. โหลดไฟล์ .env มาใช้งาน
    ConfigModule.forRoot({
      isGlobal: true, // ตัวนี้สำคัญมาก ทำให้ทุกไฟล์อ่านค่า .env ได้
    }),

    // 2. เชื่อมต่อ Database โดยดึงค่าจาก .env (แก้ไขชื่อตัวแปรให้ตรงกับไฟล์ .env)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'), // แก้จาก DATABASE_HOST
        port: configService.get<number>('DB_PORT'), // แก้จาก DATABASE_PORT
        username: configService.get<string>('DB_USERNAME'), // แก้จาก DATABASE_USER
        password: configService.get<string>('DB_PASSWORD'), // แก้จาก DATABASE_PASSWORD
        database: configService.get<string>('DB_DATABASE'), // แก้จาก DATABASE_NAME
        entities: [User, Flight, Booking],
        synchronize: true, // Development mode: สร้างตารางให้อัตโนมัติ (Production ควรปิด)
      }),
    }),

    // 3. ลงทะเบียนโมดูลการทำงานทั้งหมด
    AuthModule,
    FlightsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
