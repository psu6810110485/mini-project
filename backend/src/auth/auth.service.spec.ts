import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => { // ชื่อชุดทดสอบ เทสพ่อครัว
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ // สร้าง TestingModule ห้องทดลองจิ๋ว
      providers: [AuthService], // ใส่ AuthService เป็นผู้ให้บริการในห้องทดลอง
    }).compile(); // รวบรวมและเตรียมห้องทดลองให้พร้อมใช้งาน

    service = module.get<AuthService>(AuthService); // หยิบ AuthService ออกมาเก็บในตัวแปร service
  });

  it('should be defined', () => { // ทดสอบว่า service ถูกสร้างขึ้นมาเรียบร้อย
    expect(service).toBeDefined();
  });
});

//สรุปสั้นๆ
//ไฟล์นี้เอาไว้เทส Logic การทำงาน (เช่น สมัครสมาชิกแล้วพาสเวิร์ดถูกเข้ารหัสจริงไหม?)

//ใช้ providers แทน controllers ในการตั้งค่าห้องทดลอง

//ณ ตอนนี้: มันเป็นแค่ไฟล์ตั้งต้น เอาไว้เช็คว่าไฟล์ Service ไม่พังตอนเริ่มสร้างโปรเจกต์ครับ