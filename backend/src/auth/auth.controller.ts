// ===============================
// AuthController
// ไฟล์นี้ทำหน้าที่รับ Request เกี่ยวกับการ Login / Register / ตรวจ Token
// ===============================

// Import decorator พื้นฐานจาก NestJS
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';

// Import Service ที่ทำ Business Logic จริง ๆ
import { AuthService } from './auth.service';

// Import เครื่องมือ Swagger (ใช้สร้างเอกสาร API)
import { ApiTags, ApiBody, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';

// Import Guard สำหรับตรวจ JWT
import { AuthGuard } from '@nestjs/passport';

// Import class-validator สำหรับตรวจสอบข้อมูลที่ส่งมา
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

// ===============================
// 1️⃣ DTO สำหรับ Register
// ใช้กำหนดโครงสร้าง + Validation ของข้อมูลสมัครสมาชิก
// ===============================
export class RegisterDto {

  // ใช้แสดงตัวอย่าง field ใน Swagger
  @ApiProperty({
    example: 'Customer One',
    description: 'ชื่อผู้ใช้งาน (ห้ามว่าง)',
  })

  // ต้องเป็น string
  @IsString()

  // ห้ามเป็นค่าว่าง
  @IsNotEmpty()
  name: string;

  // -------------------------------

  @ApiProperty({ example: 'user@test.com' })

  // ต้องเป็นรูปแบบ email
  @IsEmail()

  // ห้ามว่าง
  @IsNotEmpty()
  email: string;

  // -------------------------------

  @ApiProperty({ example: 'password123' })

  // ต้องเป็น string
  @IsString()

  // ความยาวขั้นต่ำ 6 ตัวอักษร
  @MinLength(6)

  // ห้ามว่าง
  @IsNotEmpty()
  password: string;

  // -------------------------------

  @ApiProperty({
    example: 'USER',
    description: 'เลือกได้ระหว่าง ADMIN หรือ USER',
    required: false,
  })

  // ต้องเป็น string
  @IsString()

  // เป็น field ที่ไม่จำเป็นต้องส่งมาก็ได้
  @IsOptional()
  role?: string;
}

// ===============================
// 2️⃣ DTO สำหรับ Login
// ใช้ตรวจสอบข้อมูลตอนเข้าสู่ระบบ
// ===============================
export class LoginDto {

  @ApiProperty({ example: 'user@test.com' })

  // ต้องเป็น email
  @IsEmail()

  // ห้ามว่าง
  @IsNotEmpty()
  email: string;

  // -------------------------------

  @ApiProperty({ example: 'password123' })

  // ต้องเป็น string
  @IsString()

  // ห้ามว่าง
  @IsNotEmpty()
  password: string;
}

// ===============================
// Controller หลักของ Auth
// ===============================

// ตั้งชื่อหมวดใน Swagger
@ApiTags('Auth')

// URL หลักของ Controller นี้คือ /auth
@Controller('auth')
export class AuthController {

  // Inject AuthService เข้ามาใช้งาน
  constructor(private authService: AuthService) {}

  // ===============================
  // 3️⃣ API สมัครสมาชิก
  // POST /auth/register
  // ===============================
  @Post('register')

  // บอก Swagger ว่า Body ใช้ RegisterDto
  @ApiBody({ type: RegisterDto })
  async register(@Body() userData: RegisterDto) {

    // ส่งข้อมูลไปให้ Service จัดการต่อ
    return this.authService.register(userData);
  }

  // ===============================
  // 4️⃣ API Login
  // POST /auth/login
  // ===============================
  @Post('login')

  // บอก Swagger ว่า Body ใช้ LoginDto
  @ApiBody({ type: LoginDto })
  async login(@Body() loginData: LoginDto) {

    // ส่งข้อมูลไปให้ Service ตรวจสอบ และสร้าง JWT
    return this.authService.login(loginData);
  }

  // ===============================
  // 5️⃣ API ทดสอบ Token
  // GET /auth/profile
  // ===============================

  // ใช้ JWT Guard ป้องกัน API
  // ต้องแนบ Token ถึงจะเข้าได้
  @UseGuards(AuthGuard('jwt'))

  // แสดงปุ่ม Authorization ใน Swagger
  @ApiBearerAuth()

  @Get('profile')
  getProfile(@Request() req) {

    // req.user มาจาก JWT Strategy
    // เป็นข้อมูล user ที่ถูก decode จาก Token
    return req.user;
  }
}
