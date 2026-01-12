import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


//"คู่มือการทำงานของ รปภ. JWT"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) { //configService: คือคนส่งสาร ที่วิ่งไปอ่านไฟล์ .env

    // ✅ ใช้ JWT_SECRET จาก .env (secretKeyTudTud1234)
    const secret = configService.get<string>('JWT_SECRET') || 'secretKeyTudTud1234';
    
    // 🔍 Debug log เพื่อตรวจสอบว่า secret โหลดถูกต้อง
    console.log('🔐 JWT Strategy initialized with secret:', secret.substring(0, 10) + '...');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),//ให้ค้นหา Token ที่ส่วนหัวของจดหมาย (Header) ในช่องที่ชื่อว่า Bearer
      ignoreExpiration: false, //ไม่ละเลยการหมดอายุของ Token
      secretOrKey: secret, //ใช้รหัสลับที่ได้จาก .env
    });
  }

  async validate(payload: any) { // ฟังก์ชันนี้จะถูกเรียกเมื่อ Token ถูกตรวจสอบแล้วว่า ถูกต้อง
    // 🔍 Debug log เพื่อดูข้อมูลที่ถอดรหัสจาก Token
    console.log('✅ JWT Payload validated:', {
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    });
    
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}