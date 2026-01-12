import { Entity, PrimaryGeneratedColumn, Column, OneToMany, VersionColumn, ManyToMany, JoinTable } from 'typeorm';
import { Booking } from './booking.entity';
import { Amenity } from './amenity.entity'; 

@Entity('flights') //สร้างตาราง flights ใน database 
export class Flight { // สร้าง entity Flight คือการกำหนดแบบฟอร์มว่าต้องเป็นยังไงบ้าง ในชื่อ Flight
  @PrimaryGeneratedColumn() // ให้สร้างคีย์หลักแบบอัตโนมัติ primary key generated column
  flight_id: number;

  @Column() // สร้างคอลัมน์ flight_code เก็บค่าเป็น string
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


  //สำคัญที่สุด ในระบบจองตั๋วครับ! มันมีไว้ป้องกัน "การแย่งกันจอง" (Race Condition)
  // ✅ เช็คให้ชัวร์ว่าใส่ default: 1 แล้วนะครับ (จากข้อเมื่อกี้)
  @VersionColumn({ default: 1 }) // ใช้สำหรับจัดการกับ concurrent updates สมมมุติว่ามีคนจองตั๋วพร้อมกัน มันจะเช็ค version ว่าตรงกันไหม 
  version: number; 

  @OneToMany(() => Booking, (booking) => booking.flight) //() => Booking: เป็นการชี้เป้าว่า "ลูกของฉันคือตาราง Booking นะ
  bookings: Booking[];

  // -----------------------------------------------------------
  // 🔴 จุดที่แก้ไข: เปลี่ยนชื่อ name ตรงนี้ครับ 🔴
  // จาก 'flight_amenities' -> เปลี่ยนเป็น 'flight_amenities_list'
  // เพื่อหนีตารางเก่าที่ Error ครับ
  // -----------------------------------------------------------
  @ManyToMany(() => Amenity) // ตารางความสัมพันธ์แบบ many-to-many ระหว่าง Flight กับ Amenity
  @JoinTable({ // กำหนดตารางเชื่อมโยงตรงกลาง
    name: 'flight_amenities_list', // ✅ เปลี่ยนชื่อใหม่ตรงนี้
    joinColumn: { name: 'flight_id', referencedColumnName: 'flight_id' },//ในตารางแม่สื่อ ให้สร้างคอลัมน์ flight_id ไว้เก็บไอดีของฉัน
    inverseJoinColumn: { name: 'amenity_id', referencedColumnName: 'amenity_id' } //และสร้างคอลัมน์ amenity_id ไว้เก็บไอดีของอีกฝ่าย (Amenity)
  })
  amenities: Amenity[];
}