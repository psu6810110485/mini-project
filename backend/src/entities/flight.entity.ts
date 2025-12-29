import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';

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

  @OneToMany(() => Booking, (booking) => booking.flight)
  bookings: Booking[];
}