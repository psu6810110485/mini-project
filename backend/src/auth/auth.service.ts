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
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    // สร้าง User พร้อมกำหนด Role (ถ้าไม่ส่งมาจะใช้ USER เป็นค่าเริ่มต้น)
    const user = this.userRepository.create({ 
      email, 
      name, 
      password: hashedPassword,
      role: role || 'USER' 
    });
    await this.userRepository.save(user);
    return { message: 'User registered successfully' };
  }

  async login(loginData: any) {
    const { email, password } = loginData;
    const user = await this.userRepository.findOne({ where: { email } });
    
    // ตรวจสอบรหัสผ่าน
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // สร้าง JWT Payload
    const payload = { sub: user.user_id, email: user.email, role: user.role };
    
    // ส่งทั้ง Token และข้อมูล User เพื่อให้ Frontend นำไปใช้งานต่อได้ทันที
    return { 
      access_token: await this.jwtService.signAsync(payload),
      user: {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}