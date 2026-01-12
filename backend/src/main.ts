// 1. เพิ่มบรรทัดนี้บนสุด เพื่อให้ console.log อ่านไฟล์ .env ได้ทันที
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule); //Nest! ช่วยประกอบร่างแอปตามแบบแปลน AppModule

    // --- DEBUG SECTION (เช็คค่า Environment) ---
    console.log('-------------------------------------------');
    console.log('--- 🛠️  DEBUG CONNECTION INFO 🛠️ ---');
    console.log(`DB_HOST:     ${process.env.DB_HOST}`); // ดูตรงนี้ว่าใช่ localhost ไหม เจาะ .env ไปดู
    console.log(`DB_PORT:     ${process.env.DB_PORT}`);
    console.log(`DB_USERNAME: ${process.env.DB_USERNAME}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD}`); // ดูตรงนี้ว่าใช่ password123 ไหม
    console.log('-------------------------------------------');
    // ----------------------------------------

    // 2. เปิดใช้งาน CORS เพื่อให้ Frontend ติดต่อกับ Backend ได้
    app.enableCors({//กำหนดค่า CORS (การอนุญาตข้ามแหล่งที่มา) เพื่อให้ Frontend ที่รันบนพอร์ต 5173 ติดต่อกับ Backend ได้
      origin: 'http://localhost:5173', //อนุญาตเฉพาะจากแหล่งที่มานี้
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', //อนุญาตให้ทำอะไรได้
      credentials: true, //อนุญาตให้ส่งคุกกี้และข้อมูลรับรองอื่นๆ ได้ cookies token
    });

    // 🚀 เพิ่ม: Global Validation Pipe (ใช้ตรวจสอบข้อมูลที่ส่งเข้ามาใน API) Ex. กันไม่ให้User แอบใส่ Role admin มา
    app.useGlobalPipes( //ใช้ท่อกรองข้อมูลทั่วแอป
      new ValidationPipe({
        whitelist: true, //ลบฟิลด์ที่ไม่ได้กำหนดใน DTO ออก
        transform: true, //แปลงข้อมูลให้อัตโนมัติตาม Type ที่กำหนดใน DTO Ex. Age string -> Age number
        forbidNonWhitelisted: true, //ตะโกน error ใส่ ถ้ามีฟิลด์แปลกปลอม
      }),
    );

    // 🚀 เพิ่ม: Enable Graceful Shutdown
    app.enableShutdownHooks(); //เปิดใช้งานฮุกสำหรับจัดการการปิดแอปอย่างนุ่มนวล รอทำงานเสร็จก่อนปิด ไม่เหมือน Ctrl+C ธรรมดา

    // 3. ตั้งค่า Swagger
    const config = new DocumentBuilder() //สร้างการตั้งค่าเอกสาร Swagger หน้าเว็บคู่มือการใช้ API
      .setTitle('Flight Booking API')
      .setDescription('ระบบจองตั๋วเครื่องบิน Mini-Project')
      .setVersion('1.0')
      .addBearerAuth() //เพิ่มการรองรับการยืนยันตัวตนแบบ Bearer Token (JWT)
      .build();
    const document = SwaggerModule.createDocument(app, config); //สร้างเอกสาร Swagger จากการตั้งค่าข้างบน 
    SwaggerModule.setup('api', app, document); // สร้าง Route ชื่อ '/api' เพื่อเข้าไปดู Swagger UI

    // 4. เริ่มรัน Server
    const port = process.env.PORT ?? 3000;
    await app.listen(port); // สั่งให้แอปรันบนพอร์ตที่กำหนดใน .env หรือ 3000 ถ้าไม่กำหนด

    console.log('-------------------------------------------');
    console.log('✅ Application started successfully!');
    console.log(`🚀 Backend is running on: http://localhost:${port}`);
    console.log(`📖 Swagger API Docs: http://localhost:${port}/api`);
    console.log('-------------------------------------------');
  } catch (error) {
    // 🚀 เพิ่ม: Error Handling
    console.error('-------------------------------------------');
    console.error('❌ Failed to start application');
    console.error('Error:', error.message);
    console.error('-------------------------------------------');

    // ตรวจสอบว่าเป็น Database Error หรือไม่ จะแปลerror ให้ง่ายขึ้น
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) { //กรณีลืมเปิก Database
      console.error('');
      console.error('💡 Possible Solutions:');
      console.error('1. Make sure Docker is running');
      console.error('2. Start database: docker-compose up -d');
      console.error('3. Check database connection in .env file');
      console.error('4. Verify port 5444 is not in use');
      console.error('');
    }

    process.exit(1); // ออกจากโปรแกรมด้วยรหัส 1 (แสดงว่ามีข้อผิดพลาดเกิดขึ้น)
  }
}

bootstrap();