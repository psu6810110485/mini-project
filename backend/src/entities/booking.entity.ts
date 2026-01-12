import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Flight } from './flight.entity';
import { User } from './user.entity';

// ✅ แก้ไข: เปลี่ยนจาก 'BOOKINGS' เป็น 'bookings' (ตัวพิมพ์เล็ก)
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  booking_id: number;

  @Column()
  user_id: number;

  @Column()
  flight_id: number;

  @Column()
  seat_count: number;

  @Column('decimal', { precision: 10, scale: 2 })  // ราคาแบบทศนิยม 2 ตำแหน่ง เก็บตัวเลขได้ทั้งหมด 10 หลัก
  total_price: number;

  @Column({ default: 'Confirmed' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  booking_time: Date; //ตัวยึดเวลากลางของ server ให้เป็นมาตรฐานเดียวกัน

  // ✅ Relation กับ Flight (เพิ่ม onDelete: 'CASCADE' เพื่อให้ลบ Flight ได้โดยไม่ติด FK)
  @ManyToOne(() => Flight, { eager: false, onDelete: 'CASCADE' }) //Cascade เป็นการลบแบบล้างบาง
  @JoinColumn({ name: 'flight_id' })
  flight?: Flight;

  // ✅ Relation กับ User
  @ManyToOne(() => User, (user) => user.bookings, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}