import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(userData: any) {
    const { email, password, name, role } = userData;
    
    // ✅ ตรวจสอบว่ามี User นี้อยู่แล้วหรือไม่
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ✅ สร้าง User ใหม่
    const user = this.userRepository.create({ 
      email, 
      name, 
      password: hashedPassword,
      role: role || 'USER' 
    });
    
    await this.userRepository.save(user);
    
    console.log('✅ User registered successfully:', email);
    return { message: 'User registered successfully' };
  }

  async login(loginData: any) {
    const { email, password } = loginData;
    
    // ✅ หา User ตาม email
    const user = await this.userRepository.findOne({ where: { email } });
    
    // ✅ ตรวจสอบรหัสผ่าน
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.error('❌ Invalid credentials for email:', email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // ✅ สร้าง JWT Payload
    const payload = { 
      sub: user.user_id, 
      email: user.email, 
      role: user.role 
    };
    
    // ✅ สร้าง Token
    const token = await this.jwtService.signAsync(payload);
    
    console.log('✅ User logged in successfully:', email);
    console.log('🔐 Generated token:', token.substring(0, 30) + '...');
    
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