import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn()
  amenity_id: number;

  @Column()
  name: string; // เช่น "Free WiFi", "Meal Included"

  @Column({ nullable: true })
  icon: string; // เก็บชื่อ icon หรือ url
}