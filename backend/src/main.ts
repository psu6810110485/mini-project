// ===============================
// โหลดค่า Environment (.env)
// ===============================

// นำเข้า dotenv เพื่ออ่านไฟล์ .env
import * as dotenv from 'dotenv';

// สั่งให้ dotenv โหลดค่าจากไฟล์ .env เข้า process.env
// ต้องอยู่บนสุด เพื่อให้ console.log และ config อื่น ๆ อ่านค่าได้ทันที
dotenv.config();


// ===============================
// Import Core ของ NestJS และเครื่องมือเสริม
// ===============================

// ใช้สร้าง NestJS Application
import { NestFactory } from '@nestjs/core';

// AppModule คือศูนย์รวม Controller / Service / Module ทั้งหมด
import { AppModule } from './app.module';

// ใช้สร้างเอกสาร Swagger (API Documentation)
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// ใช้ตรวจสอบความถูกต้องของข้อมูล Request (Validation)
import { ValidationPipe } from '@nestjs/common';


// ===============================
// ฟังก์ชัน bootstrap (จุดเริ่มต้นของระบบ)
// ===============================
async function bootstrap() {
  try {
    // -------------------------------
    // สร้าง NestJS Application
    // -------------------------------
    // โหลดทุก Module และเตรียม Dependency Injection
    const app = await NestFactory.create(AppModule);

    // -------------------------------
    // DEBUG SECTION
    // ใช้ตรวจสอบว่า .env ถูกโหลดถูกต้องหรือไม่
    // -------------------------------
    console.log('-------------------------------------------');
    console.log('--- 🛠️  DEBUG CONNECTION INFO 🛠️ ---');
    console.log(`DB_HOST:     ${process.env.DB_HOST}`);
    console.log(`DB_PORT:     ${process.env.DB_PORT}`);
    console.log(`DB_USERNAME: ${process.env.DB_USERNAME}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD}`);
    console.log('-------------------------------------------');
    // ส่วนนี้ช่วย Debug ปัญหา Database ต่อไม่ได้

    // -------------------------------
    // เปิดใช้งาน CORS
    // -------------------------------
    // อนุญาตให้ Frontend (localhost:5173) เรียก Backend ได้
    // ถ้าไม่เปิด CORS → Browser จะ block Request
    app.enableCors({
      origin: 'http://localhost:5173',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // -------------------------------
    // เปิด Global Validation Pipe
    // -------------------------------
    // ทำงานก่อนเข้า Controller ทุก Request
    // - whitelist: รับเฉพาะ field ที่มีใน DTO
    // - transform: แปลงชนิดข้อมูลอัตโนมัติ (string -> number)
    // - forbidNonWhitelisted: ถ้ามี field แปลก → Error ทันที
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // -------------------------------
    // Enable Graceful Shutdown
    // -------------------------------
    // ทำให้ระบบปิดตัวอย่างปลอดภัย
    // เคลียร์ DB connection และ resource ต่าง ๆ ก่อนปิด
    app.enableShutdownHooks();

    // -------------------------------
    // ตั้งค่า Swagger (API Documentation)
    // -------------------------------
    // ใช้สร้างหน้าเอกสาร API สำหรับทดสอบ Backend
    const config = new DocumentBuilder()
      .setTitle('Flight Booking API') // ชื่อ API
      .setDescription('ระบบจองตั๋วเครื่องบิน Mini-Project') // คำอธิบาย
      .setVersion('1.0') // เวอร์ชัน
      .addBearerAuth() // รองรับ JWT Authorization
      .build();

    // สร้าง Swagger Document จาก Controller ทั้งหมด
    const document = SwaggerModule.createDocument(app, config);

    // เปิดหน้า Swagger ที่ path /api
    SwaggerModule.setup('api', app, document);

    // -------------------------------
    // เริ่มรัน Server
    // -------------------------------
    // ใช้ PORT จาก .env ถ้ามี
    // ถ้าไม่มี → ใช้ 3000 เป็นค่าเริ่มต้น
    const port = process.env.PORT ?? 3000;

    // เปิด Server และรอรับ Request
    await app.listen(port);

    // -------------------------------
    // แสดงสถานะเมื่อระบบพร้อมใช้งาน
    // -------------------------------
    console.log('-------------------------------------------');
    console.log('✅ Application started successfully!');
    console.log(`🚀 Backend is running on: http://localhost:${port}`);
    console.log(`📖 Swagger API Docs: http://localhost:${port}/api`);
    console.log('-------------------------------------------');

  } catch (error) {
    // ===============================
    // Error Handling (ถ้าเปิดระบบไม่สำเร็จ)
    // ===============================
    console.error('-------------------------------------------');
    console.error('❌ Failed to start application');
    console.error('Error:', error.message);
    console.error('-------------------------------------------');

    // ตรวจสอบว่า Error เกี่ยวกับ Database หรือไม่
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('connect')
    ) {
      console.error('');
      console.error('💡 Possible Solutions:');
      console.error('1. Make sure Docker is running');
      console.error('2. Start database: docker-compose up -d');
      console.error('3. Check database connection in .env file');
      console.error('4. Verify port 5444 is not in use');
      console.error('');
    }

    // ปิดโปรแกรมทันที (สถานะ error)
    process.exit(1);
  }
}

// เรียกใช้ bootstrap เพื่อเริ่มระบบ
bootstrap();
