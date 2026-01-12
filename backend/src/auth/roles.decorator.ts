import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles); 
//(...roles: string[]):คือการบอกว่า ป้ายนี้รองรับการเขียนชื่อได้หลายคน
//SetMetadata: คือฟังก์ชันที่ใช้สร้างป้ายกำกับ (Metadata) สำหรับการกำหนดบทบาท (Roles) ใน NestJS