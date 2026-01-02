import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // ✅ เพิ่มบรรทัดนี้
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { JwtStrategy } from './jwt.strategy'; // ✅ เพิ่มบรรทัดนี้ (ต้องมีไฟล์ jwt.strategy.ts ด้วยครับ)

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule, // ✅ เพิ่มบรรทัดนี้
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy], // ✅ เพิ่ม JwtStrategy เข้าไปในนี้
  controllers: [AuthController],
  exports: [AuthService], // เพิ่มไว้เพื่อให้ Module อื่นเรียกใช้ได้
})
export class AuthModule {}
