import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {} //สร้าง Guard สำหรับตรวจสอบ JWT Token โดยใช้สืบทอดจาก AuthGuard ที่ใช้กลยุทธ์ 'jwt'