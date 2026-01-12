import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController; //ตัวแปรเก็บ instance ของ AuthController
//describe ผลการทดสอบ

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();//สร้าง TestingModule ที่มี AuthController

    controller = module.get<AuthController>(AuthController);//หยิบ AuthController ออกมาเก็บในตัวแปร controller
  });

  it('should be defined', () => {         // 1. ชื่อหัวข้อการทดสอบ
    expect(controller).toBeDefined();     // 2. ตรวจสอบว่า controller ถูกสร้างขึ้นมาเรียบร้อย เช็คว่ามีตัวตนมั้ย
  }); 
});
