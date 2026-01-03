import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Customer One' })
  @IsString()
  @IsNotEmpty()
  name: string;

  // --- ส่วนที่เพิ่มเข้ามาเพื่อแก้ Error ---
  @ApiProperty({ example: 'USER', required: false })
  @IsString()
  @IsOptional() // ใส่ IsOptional เผื่อกรณีไม่ได้ส่ง role มา ระบบจะได้ไม่ Error
  role?: string; 
}