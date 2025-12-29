import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Flight } from './entities/flight.entity';
import { Booking } from './entities/booking.entity';
import { FlightsModule } from './flights/flights.module';

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
        type: 'postgres', // ต้องเป็น postgres เท่านั้น
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Flight, Booking], // ใส่ Entity ทั้ง 3 ที่เราสร้าง
        synchronize: true, // สร้างตารางให้อัตโนมัติ (เฉพาะช่วงพัฒนา)
      }),
    }),
    FlightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}