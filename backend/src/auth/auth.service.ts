// ===============================
// Import เครื่องมือหลักจาก NestJS
// ===============================
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
// Injectable = บอกว่า class นี้เป็น Service และสามารถ Inject ได้
// ConflictException = Error กรณีข้อมูลซ้ำ (HTTP 409) เช่น เมลนี้ 123@psu.ac.th ไม่สามารถใช้ซ้ำได้ 
// UnauthorizedException = Error กรณี login ไม่ผ่าน (HTTP 401)

// ===============================
// Import TypeORM 

// ===============================Repository = เครื่องมือ CRUD ของตาราง และ CRUD = ชุดคำสั่งพื้นฐานในการจัดการข้อมูลใน Database
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// InjectRepository = ดึง Repository ของ Entity มาใช้
// Repository = เครื่องมือ CRUD (คุยกับ Database)

// ===============================
// Import Entity User    
// Entity คือแบบพิมพ์เขียวของตารางใน Database
// ===============================
import { User } from '../entities/user.entity';
// User = โครงสร้างตาราง users ในฐานข้อมูล

// ===============================
// Import JWT Service (JWT = (JSON Web Token))
// ===============================
import { JwtService } from '@nestjs/jwt';
// JwtService = ใช้สร้าง และตรวจสอบ JWT Token

// ทำงานร่วมกับ
//ตัว          หน้าที่  
//JwtService	สร้าง / ตรวจ Token
//JwtStrategy	แกะ Token
//AuthGuard('jwt')	กันประตู
//@UseGuards	บอก Controller ว่าต้องใช้ Guard

// ===============================
// Import bcrypt (เข้ารหัสรหัสผ่าน)
// ===============================
import * as bcrypt from 'bcrypt';
// bcrypt = ใช้ hash password และ compare password อย่างปลอดภัย
// hash คือ รหัสยึกยือ 
// compare คือ การตรวจสอบว่ารหัสจริงตรงกับ hash มั้ย

// ===============================
// AuthService (Business Logic)
// ===============================
@Injectable() //(Inject = การที่ NestJS “ส่งของให้เราใช้” อัตโนมัติโดยที่เรา ไม่ต้องสร้างของนั้นเอง)
export class AuthService {

  // Constructor ใช้ Inject Dependency เข้ามา
  constructor(
    // Inject Repository ของ User Entity
    @InjectRepository(User)
    private userRepository: Repository<User>,

    // Inject JwtService 
    private jwtService: JwtService,
  ) {}

  // ===============================
  // 1️⃣ ฟังก์ชันสมัครสมาชิก (Register)
  // ===============================
  async register(userData: any) {

    // แยกข้อมูลที่ส่งมาจาก Controller
    const { email, password, name, role } = userData;

    // 🔍 ตรวจสอบว่ามี email นี้ในระบบแล้วหรือไม่  //Repository = ตาราง 
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    // ถ้ามี user ซ้ำ → โยน error  // existingUser “ถ้ามี user ที่ใช้ email นี้อยู่แล้ว” // throw =  หยุดการทำงาน 
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 🔐 เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 10);
    // 10 = จำนวนรอบในการ hash (ยิ่งมากยิ่งปลอดภัย แต่ช้าลง)

    // 🧑‍💻 สร้าง User ใหม่ (ยังไม่บันทึก DB)
    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword, // เก็บ password ที่ถูก hash แล้ว
      role: role || 'USER', // ถ้าไม่ส่ง role มา → default = USER
    });

    // 💾 บันทึก User ลง Database
    await this.userRepository.save(user);

    console.log('✅ User registered successfully:', email);

    // ส่งข้อความตอบกลับไปที่ Client
    return { message: 'User registered successfully' };
  }

  // ===============================
  // 2️⃣ ฟังก์ชัน Login
  // =============================== any คือตัวแปรชนิดข้อมูลอะไรก็ได้ 
  async login(loginData: any) {

    // แยก email และ password จาก body
    const { email, password } = loginData;

    // 🔍 หา User จาก email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    // ❌ ถ้าไม่เจอ user หรือ password ไม่ตรง
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.error('❌ Invalid credentials for email:', email);
      throw new UnauthorizedException('Invalid credentials'); // Invalid credentials คือข้อความที่ถูกส่งไปยัง  Client / Postman
    }

    // 🧾 สร้าง JWT Payload (ข้อมูลที่ฝังใน Token)
    const payload = {
      sub: user.user_id, // user id
      email: user.email,
      role: user.role,   // USER หรือ ADMIN
    };

    // 🔐 สร้าง JWT Token
    const token = await this.jwtService.signAsync(payload);

    console.log('✅ User logged in successfully:', email);
    console.log('🔐 Generated token:', token.substring(0, 30) + '...');

    // 📦 ส่ง Token + ข้อมูล User กลับไป
    return {
      access_token: token,
      user: {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
