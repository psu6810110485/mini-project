// backend/src/entities/flight-amenity.entity.ts

// ===============================
// Import จาก TypeORM
// ===============================
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// Entity      = ใช้ประกาศว่า Class นี้แทนตารางใน Database
// PrimaryGeneratedColumn = สร้าง Primary Key แบบ Auto Increment
// Column      = กำหนดคอลัมน์ในตาราง

// ===============================
// ประกาศ Entity FlightAmenity
// ===============================
@Entity('flight_amenities') 
// @Entity('flight_amenities') = ชื่อจริงของตารางใน Database คือ flight_amenities
export class FlightAmenity {

  // ===============================
  // Primary Key
  // ===============================
  @PrimaryGeneratedColumn()
  amenity_id: number; 
  // amenity_id = รหัสหลักของ amenity, สร้างอัตโนมัติ (Auto Increment)

  // ===============================
  // Name ของ Amenity
  // ===============================
  @Column()
  name: string; 
  // name = ชื่อสิ่งอำนวยความสะดวก เช่น "Wi-Fi", "Meal", "Entertainment", "USB Charging"

  // ===============================
  // Description ของ Amenity (ไม่บังคับ)
  // ===============================
  @Column({ nullable: true })
  description: string; 
  // description = รายละเอียดเพิ่มเติมของ amenity
  // nullable: true = สามารถเว้นว่างได้
}


//ใช้ TypeORM แปลง Class → ตารางในฐานข้อมูล
//ตารางนี้เก็บ สิ่งอำนวยความสะดวกของเที่ยวบิน