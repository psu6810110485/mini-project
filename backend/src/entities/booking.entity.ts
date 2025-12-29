import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Flight } from './flight.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  booking_id: number;

  @Column()
  seat_count: number;

  @Column()
  total_price: number;

  @Column({ default: 'Confirmed' })
  status: string;

  @CreateDateColumn()
  booking_time: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  user: User;

  @ManyToOne(() => Flight, (flight) => flight.bookings)
  flight: Flight;
}