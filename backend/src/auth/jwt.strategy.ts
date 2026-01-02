import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    // 🔍 Debug: เช็คดูว่าอ่านค่าได้จริงไหม
    if (!secret) {
      console.log(
        '⚠️ Warning: ไม่พบ JWT_SECRET ใน .env ระบบจะใช้กุญแจสำรองแทน',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ✅ แก้ไข: ถ้าหา secret ไม่เจอ ให้ใช้ string สำรองแทน (กันโปรแกรม Crash)
      secretOrKey: secret || 'MyFallbackSecretKey123',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
