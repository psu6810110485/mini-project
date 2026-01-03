import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
// Import เพิ่มเติมสำหรับตรวจสอบข้อมูล (Validation)
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

// 1. DTO สำหรับ Register (รวม Validation เข้าไปให้แล้ว)
export class RegisterDto {
  @ApiProperty({ example: 'Customer One', description: 'ชื่อผู้ใช้งาน (ห้ามว่าง)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'USER', description: 'เลือกได้ระหว่าง ADMIN หรือ USER', required: false })
  @IsString()
  @IsOptional() // ใส่เป็น Optional เพื่อไม่ให้ error ถ้าไม่ส่งมา
  role?: string;
}

// 2. DTO สำหรับ Login (รวม Validation เข้าไปให้แล้ว)
export class LoginDto {
  @ApiProperty({ example: 'user@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  async register(@Body() userData: RegisterDto) {
    // ถ้า role ไม่ถูกส่งมา อาจจะกำหนดค่า Default ที่ Service หรือตรงนี้ก็ได้
    return this.authService.register(userData);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  // ✅ 3. Endpoint สำหรับทดสอบ Token (งานเดิมของคุณ)
  @UseGuards(AuthGuard('jwt')) // ต้องมี Token ถึงจะเข้าได้
  @ApiBearerAuth() // โชว์ปุ่มใส่ Token ใน Swagger
  @Get('profile')
  getProfile(@Request() req) {
    // ส่งข้อมูล User ที่แกะได้จาก Token กลับไป
    return req.user;
  }
}