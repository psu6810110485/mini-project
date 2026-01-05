import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { Flight } from '../entities/flight.entity';
import { Amenity } from '../entities/amenity.entity'; // เพิ่ม import

@Module({
  imports: [TypeOrmModule.forFeature([Flight, Amenity])], // เพิ่ม Amenity ตรงนี้
  providers: [FlightsService],
  controllers: [FlightsController],
  exports: [FlightsService], 
})
export class FlightsModule {}