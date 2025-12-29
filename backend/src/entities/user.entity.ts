import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'USER' }) // สำหรับทำ Authorization แบ่ง ADMIN/USER
  role: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}