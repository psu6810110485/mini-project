import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column({ unique: true }) // อีเมลต้องไม่ซ้ำกัน
  email: string;

  @Column()
  password: string;

  @Column({ default: 'USER' }) // สำหรับทำ Authorization แบ่ง ADMIN/USER
  role: string; // Set Default as 'USER'

  @OneToMany(() => Booking, (booking) => booking.user) // 1 จองตั๋วได้หลายใบ
  bookings: Booking[];
}