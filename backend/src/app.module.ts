// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { FlightsModule } from './flights/flights.module';
import { BookingsModule } from './bookings/bookings.module';

// ✅ Import Entity ใหม่
import { User } from './entities/user.entity';
import { Flight } from './entities/flight.entity';
import { Booking } from './entities/booking.entity';
import { FlightAmenity } from './entities/flight-amenity.entity'; // ✅ เพิ่มบรรทัดนี้

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
        const host = '127.0.0.1';
        const port = 5444;
        const username = 'admin';
        const password = 'newpassword999';
        const database = 'flight_booking_db';

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
          
          // ✅ แก้ไขจาก pattern เป็น explicit imports
          entities: [User, Flight, Booking, FlightAmenity], // ✅ เพิ่ม FlightAmenity
          
          synchronize: true,
          logging: false,
          autoLoadEntities: true,
          retryAttempts: 10,
          retryDelay: 3000,
          connectTimeoutMS: 10000,
          maxQueryExecutionTime: 5000,
        };
      },
    }),
    AuthModule,
    FlightsModule,
    BookingsModule,
  ],
})
export class AppModule {}