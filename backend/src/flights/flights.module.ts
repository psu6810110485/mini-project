//แผนกบิน flights.module.ts จัดการเที่ยวบินใช้รวบรวมเครื่องมือทั้งหมดในแผนกไว้ด้วยกัน เพื่อให้พร้อมทำงาน
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { Flight } from '../entities/flight.entity';
import { Amenity } from '../entities/amenity.entity'; // เพิ่ม import

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Amenity])], // เพิ่ม Amenity ตรงนี้ แผนกนี้ ขอเบิกสิทธิ์เข้าถึงตาราง Flight และตาราง Amenity
  providers: [FlightsService],//สมองและแรงงาน ของระบบ
  controllers: [FlightsController], // ทางเข้าออกของข้อมูลเที่ยวบิน
  exports: [FlightsService], 
})
export class FlightsModule {}