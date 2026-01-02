import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // ต้องลงทะเบียน Swagger เพื่อทดสอบ API

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. เปิดใช้งาน CORS (แก้ปัญหาตัวแดงในรูป image_87072c.png)
  app.enableCors({
    origin: 'http://localhost:5173', // อนุญาตให้ Frontend พอร์ต 5173 เข้าถึงได้
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. ตั้งค่า Swagger (ใช้สำหรับทดสอบ API ทุกเส้นผ่าน Browser)
  const config = new DocumentBuilder()
    .setTitle('Flight Booking API')
    .setDescription('ระบบจองตั๋วเครื่องบิน Mini-Project')
    .setVersion('1.0')
    .addBearerAuth() // สำหรับใส่ JWT Token ในการทดสอบ
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 3. เริ่มรัน Server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Backend is running on: http://localhost:${port}`);
  console.log(`📖 Swagger API Docs: http://localhost:${port}/api`);
}
bootstrap();
