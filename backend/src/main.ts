// 1. เพิ่มบรรทัดนี้บนสุด เพื่อให้ console.log อ่านไฟล์ .env ได้ทันที
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // --- DEBUG SECTION (เช็คค่า Environment) ---
    console.log('-------------------------------------------');
    console.log('--- 🛠️  DEBUG CONNECTION INFO 🛠️ ---');
    console.log(`DB_HOST:     ${process.env.DB_HOST}`);
    console.log(`DB_PORT:     ${process.env.DB_PORT}`);
    console.log(`DB_USERNAME: ${process.env.DB_USERNAME}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD}`); // ดูตรงนี้ว่าใช่ password123 ไหม
    console.log('-------------------------------------------');
    // ----------------------------------------

    // 2. เปิดใช้งาน CORS
    app.enableCors({
      origin: 'http://localhost:5173',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // 🚀 เพิ่ม: Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 🚀 เพิ่ม: Enable Graceful Shutdown
    app.enableShutdownHooks();

    // 3. ตั้งค่า Swagger
    const config = new DocumentBuilder()
      .setTitle('Flight Booking API')
      .setDescription('ระบบจองตั๋วเครื่องบิน Mini-Project')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // 4. เริ่มรัน Server
    const port = process.env.PORT ?? 3000;
    await app.listen(port);

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

    // ตรวจสอบว่าเป็น Database Error หรือไม่
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      console.error('');
      console.error('💡 Possible Solutions:');
      console.error('1. Make sure Docker is running');
      console.error('2. Start database: docker-compose up -d');
      console.error('3. Check database connection in .env file');
      console.error('4. Verify port 5444 is not in use');
      console.error('');
    }

    process.exit(1);
  }
}

bootstrap();