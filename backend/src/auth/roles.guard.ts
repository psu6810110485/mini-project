import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate { //สร้าง Guard สำหรับตรวจสอบบทบาท (Roles) ของผู้ใช้
  constructor(private reflector: Reflector) {} //เอาไว้ส่องดู "ป้าย @Roles" ที่เราแอบแปะไว้ (Metadata) เพราะคนธรรมดามองไม่เห็น ต้องใช้ Reflector ส่องถึงจะเห็น

  canActivate(context: ExecutionContext): boolean { //ฟังก์ชันหลักที่ใช้ตรวจสอบว่า ผู้ใช้มีสิทธิ์เข้าถึงเส้นทางนี้หรือไม่ true = ผ่าน, false = ไม่ผ่าน
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ //ใช้แว่นส่องดูป้าย @Roles
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) { //ถ้าไม่มีป้าย @Roles แปะไว้เลย ก็ปล่อยผ่าน
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
} //Guard นี้จะตรวจสอบว่าผู้ใช้มีบทบาท (Role) ที่จำเป็นในการเข้าถึงเส้นทางหรือไม่ โดยใช้ข้อมูลที่กำหนดผ่าน Roles Decorator