import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from '../entities/flight.entity';
import { CreateFlightDto } from './dto/create-flight.dto'; // ✅ นำเข้า DTO

@Injectable() // บอก NestJS ว่านี่คือ Service ที่สามารถฉีดพึ่งพิงได้เอาไปใช้ที่อื่นได้
export class FlightsService {
  constructor(
    @InjectRepository(Flight) // ฉีด Repository ของ Flight เข้ามาใช้
    private flightRepository: Repository<Flight>, // ตัวแปรเก็บรีโพสิตอรี่ (ตาราง) เที่ยวบิน
  ) {}
 
  async findAll(): Promise<Flight[]> { // findAll ดึงข้อมูลเที่ยวบินทั้งหมด ขอดูเมนูทั้งหมด คืนค่ากลับเป็น Array ของ Flight
    return await this.flightRepository.find(); // ใช้ TypeORM หาเที่ยวบินทั้งหมด select * from flights
  }

  async findOne(flight_id: number): Promise<Flight> { // findOne ดึงข้อมูลเที่ยวบินตาม flight_id ที่ระบุ ไว้หาเที่ยวบินเฉพาะ
    const flight = await this.flightRepository.findOne({ where: { flight_id } });
    if (!flight) {// ถ้าไม่เจอเที่ยวบิน
      throw new NotFoundException(`ไม่พบเที่ยวบินรหัส ${flight_id}`);
    }
    return flight;
  }

  // ✅ แก้ไข: จับคู่ตัวแปรจาก DTO (CamelCase) ไปยัง Database (Snake_case) ให้ถูกต้อง
  async create(dto: CreateFlightDto): Promise<Flight> {
    const flight = this.flightRepository.create({
      // ฝั่งซ้าย = ชื่อ Column ใน Database (Snake_case)
      // ฝั่งขวา = ชื่อตัวแปรที่รับมาจาก DTO (CamelCase)
      
      //เป็น "ล่าม" ครับ คอยบอกว่า "สิ่งที่หน้าเว็บส่งมาว่า flightCode ให้เอาไปยัดใส่ช่อง flight_code ในตาราง
      flight_code: dto.flightCode,          // 👈 แก้จาก dto.flight_code เป็น dto.flightCode
      origin: dto.origin,
      destination: dto.destination,
      
      // หมายเหตุ: ถ้า DTO ส่งมาเป็น String ให้ใช้ new Date()
      // ถ้าส่งมาเป็น Date อยู่แล้วก็ใช้ dto.travelDate ได้เลย
      travel_date: new Date(dto.travelDate), // 👈 แก้จาก dto.travel_date เป็น dto.travelDate
      
      price: dto.price,
      available_seats: dto.availableSeats,   // 👈 แก้จาก dto.available_seats เป็น dto.availableSeats
      
      status: 'Active'
    });
    
    return await this.flightRepository.save(flight);
  }

  async update(flight_id: number, updateData: Partial<Flight>): Promise<Flight> { // Partial<Flight> คือ อนุญาตให้อัพเดทบางฟิลด์ได้
    const flight = await this.findOne(flight_id); // findOneหาเที่ยวบินก่อน ถ้าไม่เจอจะโยน NotFoundException
    Object.assign(flight, updateData);// นำข้อมูลจาก updateData มาทับข้อมูลเดิมใน flight 
    return await this.flightRepository.save(flight);// บันทึกการเปลี่ยนแปลง
  }

  async remove(flight_id: number): Promise<void> {
    const result = await this.flightRepository.delete(flight_id);//ส่งแค่ ID ไปสั่งลบเลย ไม่ต้องดึงของออกมาก่อน
    if (result.affected === 0) {//affected คือ จำนวนแถวที่ถูกลบ ถ้าเป็น 0 แปลว่าไม่มีแถวไหนถูกลบเลย
      throw new NotFoundException(`ไม่สามารถลบได้ เนื่องจากไม่พบรหัส ${flight_id}`);
    }
  }

  async decrementSeats(flight_id: number, count: number): Promise<void> { // ฟังก์ชันลดจำนวนที่นั่งว่าง ระบบตัดสต็อก
    const flight = await this.findOne(flight_id); // findOneหาเที่ยวบินก่อน ถ้าไม่เจอจะโยน NotFoundException
    if (flight.available_seats < count) { // ถ้าที่นั่งว่างน้อยกว่าจำนวนที่ต้องการจอง
      throw new BadRequestException('ขออภัย จำนวนที่นั่งว่างไม่เพียงพอ');
    }
    flight.available_seats -= count;  // ลดจำนวนที่นั่งว่าง
    await this.flightRepository.save(flight); // บันทึกการเปลี่ยนแปลง อัพเดตลง database เลยต้องมี await
  }
}