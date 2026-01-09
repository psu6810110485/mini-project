// backend/src/entities/flight.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  ManyToMany, 
  JoinTable, 
  VersionColumn 
} from 'typeorm';
import { Booking } from './booking.entity';
import { FlightAmenity } from './flight-amenity.entity'; // ✅ Import Entity ใหม่

@Entity('flights')
export class Flight {
  @PrimaryGeneratedColumn()
  flight_id: number;

  @Column()
  flight_code: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column({ type: 'timestamp' })
  travel_date: Date;

  @Column()
  price: number;

  @Column()
  available_seats: number;

  @Column({ default: 'Active' })
  status: string;

  // ✅ เพิ่ม Version Column เพื่อป้องกัน Race Condition
  @VersionColumn()
  version: number;

  // ✅ One-to-Many (เดิม - ไม่เปลี่ยน)
  @OneToMany(() => Booking, (booking) => booking.flight)
  bookings: Booking[];

  // ✅ Many-to-Many (ใหม่ - เที่ยวบิน 1 เที่ยวมีได้หลาย Amenities)
  @ManyToMany(() => FlightAmenity, { eager: false })
  @JoinTable({
    name: 'flight_amenity_mapping', // ชื่อตาราง Join Table
    joinColumn: { 
      name: 'flight_id', 
      referencedColumnName: 'flight_id' 
    },
    inverseJoinColumn: { 
      name: 'amenity_id', 
      referencedColumnName: 'amenity_id' 
    }
  })
  amenities: FlightAmenity[];
}