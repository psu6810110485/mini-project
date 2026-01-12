// backend/src/entities/booking.entity.ts

// ===============================
// Import จาก TypeORM และ Entity ที่เกี่ยวข้อง
// ===============================
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// Entity           = ประกาศว่า Class นี้แทนตารางใน Database
// PrimaryGeneratedColumn = สร้าง Primary Key แบบ Auto Increment
// Column           = กำหนดคอลัมน์ในตาราง
// ManyToOne        = ความสัมพันธ์แบบ หลาย Booking → หนึ่ง Flight หรือ User
// JoinColumn       = กำหนดคอลัมน์สำหรับเชื่อมความสัมพันธ์

import { Flight } from './flight.entity'; // Entity ของเที่ยวบิน
import { User } from './user.entity';     // Entity ของผู้ใช้งาน

// ===============================
// ประกาศ Entity Booking
// ===============================
@Entity('bookings') 
// ชื่อตารางจริงใน DB คือ 'bookings' (ตัวพิมพ์เล็ก)
export class Booking {

  // ===============================
  // Primary Key
  // ===============================
  @PrimaryGeneratedColumn()
  booking_id: number; 
  // รหัส Booking อัตโนมัติ

  // ===============================
  // Foreign Key: User
  // ===============================
  @Column()
  user_id: number; 
  // รหัสผู้ใช้งานที่ทำ Booking

  // ===============================
  // Foreign Key: Flight
  // ===============================
  @Column()
  flight_id: number; 
  // รหัสเที่ยวบินที่จอง

  // ===============================
  // จำนวนที่นั่ง
  // ===============================
  @Column()
  seat_count: number; 
  // จำนวนที่นั่งที่จอง

  // ===============================
  // ราคาทั้งหมด
  // ===============================
  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number; 
  // total_price = ราคาทั้งหมด, เก็บแบบ decimal 10 หลัก, ทศนิยม 2 หลัก

  // ===============================
  // สถานะการจอง
  // ===============================
  @Column({ default: 'Confirmed' })
  status: string; 
  // default = Confirmed ถ้าไม่ส่งค่า

  // ===============================
  // เวลาที่ทำการจอง
  // ===============================
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  booking_time: Date; 
  // booking_time = เวลาที่บันทึกลง DB โดยอัตโนมัติ

  // ===============================
  // Relation กับ Flight (เที่ยวบิน)
  // ===============================
  @ManyToOne(() => Flight, { eager: false }) // { eager: false } ไม่โหลดอัตโนมัติ ต้องเรียกแยก หรือใช้ QueryBuilder เพื่อโหลด Relation
  @JoinColumn({ name: 'flight_id' })
  flight?: Flight; 
  // Booking หลายอัน → Flight 1 เที่ยวบิน
  // eager: false = โหลด Relation ก็ต่อเมื่อร้องขอ (Lazy Load)
  // JoinColumn = เชื่อมกับ column flight_id

  // ===============================
  // Relation กับ User (ผู้ใช้งาน)
  // ===============================
  @ManyToOne(() => User, (user) => user.bookings, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: User; 
  // Booking หลายอัน → User 1 คน
  // Relation จะช่วยให้เข้าถึงข้อมูล User ของ Booking ได้
}
