// backend/src/entities/flight-amenity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('flight_amenities')
export class FlightAmenity {
  @PrimaryGeneratedColumn()
  amenity_id: number;

  @Column()
  name: string; // เช่น "Wi-Fi", "Meal", "Entertainment", "USB Charging"

  @Column({ nullable: true })
  description: string; // รายละเอียดเพิ่มเติม (ถ้ามี)
}