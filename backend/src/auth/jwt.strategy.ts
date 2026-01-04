import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // ✅ ใช้ JWT_SECRET จาก .env (secretKeyTudTud1234)
    const secret = configService.get<string>('JWT_SECRET') || 'secretKeyTudTud1234';
    
    // 🔍 Debug log เพื่อตรวจสอบว่า secret โหลดถูกต้อง
    console.log('🔐 JWT Strategy initialized with secret:', secret.substring(0, 10) + '...');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
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