import { Entity, PrimaryGeneratedColumn, Column, OneToMany, VersionColumn, ManyToMany, JoinTable } from 'typeorm';
import { Booking } from './booking.entity';
import { Amenity } from './amenity.entity'; 

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

  // ✅ เช็คให้ชัวร์ว่าใส่ default: 1 แล้วนะครับ (จากข้อเมื่อกี้)
  @VersionColumn({ default: 1 }) 
  version: number; 

  @OneToMany(() => Booking, (booking) => booking.flight)
  bookings: Booking[];

  // -----------------------------------------------------------
  // 🔴 จุดที่แก้ไข: เปลี่ยนชื่อ name ตรงนี้ครับ 🔴
  // จาก 'flight_amenities' -> เปลี่ยนเป็น 'flight_amenities_list'
  // เพื่อหนีตารางเก่าที่ Error ครับ
  // -----------------------------------------------------------
  @ManyToMany(() => Amenity)
  @JoinTable({
    name: 'flight_amenities_list', // ✅ เปลี่ยนชื่อใหม่ตรงนี้
    joinColumn: { name: 'flight_id', referencedColumnName: 'flight_id' },
    inverseJoinColumn: { name: 'amenity_id', referencedColumnName: 'amenity_id' }
  })
  amenities: Amenity[];
}