import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../entities/user.entity';

@Module({ //ผู้จัดการแผนก
  imports: [
    TypeOrmModule.forFeature([User]), // นำเข้า ข้อมูลUser entity เพื่อให้ AuthService ตรวจสอบ
    PassportModule,
    // ✅ วิธีที่ดีที่สุด: ระบุค่าตรงๆ ไม่ใช้ process.env ตรงนี้
    JwtModule.register({  //ตั้งค่าการทำงานของ JWT (บัตรผ่าน)
      secret: 'secretKeyTudTud1234', // กุญแจลับสำหรับเซ็น Token ลายเซ็น
      signOptions: { 
        expiresIn: '24h'
      },
    }),
  ],
  controllers: [AuthController], // ตัวควบคุม (ประตูหน้า) AuthController (คนที่รับ Login/Register
  providers: [AuthService, JwtStrategy], // ยามเฝ้าประตู (ตรวจสอบ Token)
  exports: [AuthService],
})
export class AuthModule {} // ส่งออก AuthModule (แผนกผู้ช่วยจัดการเรื่องการยืนยันตัวตน)