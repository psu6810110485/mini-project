//แบบฟอร์ม dto ว่าต้องมีอะไรบ้าง 
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail() // ตรวจสอบรูปแบบอีเมล ต้องมี @ และ โดเมน
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()// ตรวจสอบให้เป็นสตริง
  @IsNotEmpty()
  password: string;
}