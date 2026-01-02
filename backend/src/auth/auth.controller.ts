import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiProperty } from '@nestjs/swagger';

// 1. เพิ่มฟิลด์ name เข้าไปใน RegisterDto เพื่อแก้ปัญหา NOT NULL constraint
class RegisterDto {
  @ApiProperty({
    example: 'สมชาย สายการบิน',
    description: 'ชื่อผู้ใช้งาน (ห้ามว่าง)',
  })
  name: string; // เพิ่มบรรทัดนี้ครับ

  @ApiProperty({ example: 'admin@test.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'เลือกได้ระหว่าง ADMIN หรือ USER',
  })
  role: string;
}

class LoginDto {
  @ApiProperty({ example: 'admin@test.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  async register(@Body() userData: RegisterDto) {
    // ส่งข้อมูลที่มี name ครบถ้วนไปยัง AuthService
    return this.authService.register(userData);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }
}
