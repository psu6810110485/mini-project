import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) // คำสั่งNestขอเบิกเครื่องมือจัดการตาราง User Repository
    private userRepository: Repository<User>, //ค้นหาว่ามีชื่อนี้ไหม? บันทึกชื่อใหม่ลงไป
    private jwtService: JwtService,//จัดการเรื่องToken
  ) {}

  async register(userData: any) {
    const { email, password, name, role } = userData; //  รับข้อมูลจากฟรอนต์เอนด์ แยกเป็นตัวแปร
    
    // ✅ ตรวจสอบว่ามี User นี้อยู่แล้วหรือไม่
    const existingUser = await this.userRepository.findOne({ where: { email } }); // เปิดfindOne ค้นหาว่ามีemailนี้ไหม
    if (existingUser) {
      throw new ConflictException('Email already exists'); //ถ้ามีแล้วให้แจ้งเตือนว่ามีemailนี้อยู่แล้ว
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // เอารหัสผ่านมาปั่นให้ยุ่งยากขึ้น 10 คือระดับความยุ่งยาก
    
    // ✅ สร้าง User ใหม่
    const user = this.userRepository.create({ 
      email, 
      name, 
      password: hashedPassword, // บันทึกตัวที่ Hash แล้วเท่านั้น
      role: role || 'USER'      // กำหนดค่าเริ่มต้น role เป็น 'USER' ถ้าไม่มีการระบุมา
    }); 
    
    await this.userRepository.save(user); // บันทึก User ใหม่ลงฐานข้อมูล
    
    console.log('✅ User registered successfully:', email);
    return { message: 'User registered successfully' };
  }

  async login(loginData: any) { 
    const { email, password } = loginData; // รับข้อมูลจากฟรอนต์เอนด์ แยกเป็นตัวแปร
    
    // ✅ หา User ตาม email
    const user = await this.userRepository.findOne({ where: { email } }); // เปิดfindOne ค้นหาว่ามีemailนี้ไหม
    
    // ✅ ตรวจสอบรหัสผ่าน พิจารณาว่าถูกต้องไหม
    if (!user || !(await bcrypt.compare(password, user.password))) { //bcrypt.compare(รหัสที่กรอกมา, รหัสใน Database) hash แล้วเอามาเทียบกัน
      console.error('❌ Invalid credentials for email:', email);
      throw new UnauthorizedException('Invalid credentials'); //ถ้าไม่ถูกต้องแจ้งเตือนว่าข้อมูลไม่ถูกต้อง
    }

    // ✅ สร้าง JWT Payload เตรียมข้อมูลสำหรับสร้าง Token
    const payload = { 
      sub: user.user_id, 
      email: user.email, 
      role: user.role 
    };
    
    // ✅ สร้าง Token
    const token = await this.jwtService.signAsync(payload); // สร้างTokenจากข้อมูลpayload
    
    console.log('✅ User logged in successfully:', email);
    console.log('🔐 Generated token:', token.substring(0, 30) + '...'); //ตัดtokenแค่30อักษรกันรก
    
    // ✅ ส่งทั้ง Token และข้อมูล User กลับไป
    return { 
      access_token: token,
      user: {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}