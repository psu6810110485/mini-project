import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { Flight } from '../entities/flight.entity';
// ✅ [NEW] Import Entity ใหม่ (Amenities) เพื่อทำ Many-to-Many
import { FlightAmenity } from '../entities/flight-amenity.entity';

@Module({
  // ✅ [UPDATE] เพิ่ม FlightAmenity เข้าไปใน forFeature เพื่อให้ Database รู้จัก
  imports: [TypeOrmModule.forFeature([Flight, FlightAmenity])], 
  providers: [FlightsService],
  controllers: [FlightsController],
  exports: [FlightsService], // ส่งออก Service เผื่อ Module อื่นต้องใช้
})
export class FlightsModule {}