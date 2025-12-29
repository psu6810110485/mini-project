import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { Flight } from '../entities/flight.entity'; // ตรวจสอบการ Import ให้ถูก

@Module({
  imports: [TypeOrmModule.forFeature([Flight])], // ต้องมีบรรทัดนี้!
  providers: [FlightsService],
  controllers: [FlightsController],
  exports: [FlightsService], // เพิ่มตรงนี้เพื่อให้ BookingModule เรียกใช้ได้ในอนาคต
})
export class FlightsModule {}