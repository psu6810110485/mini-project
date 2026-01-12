# Mini-Project: Flight Booking System

## Project Description
ระบบเว็บแอปพลิเคชันสำหรับการจองตั๋วเครื่องบิน (Flight Booking System) พัฒนาขึ้นเพื่อเป็นส่วนหนึ่งของวิชา Full Stack Web Application Development
ระบบนี้เชื่อมต่อระหว่าง Frontend และ Backend ผ่าน RESTful API โดยรองรับการทำงานของผู้ใช้งาน 2 ระดับ คือ User (สำหรับการจอง) และ Admin (สำหรับการจัดการระบบ)

## Group Members
1. รหัสนักศึกษา: 6810110485 ชื่อ-สกุล: พัสกร เพิ่มผล
2. รหัสนักศึกษา: 6810110571 ชื่อ-สกุล: ชิษณุ แซ่เลี่ยง

## Tech Stack

### Frontend
* **Framework:** React (setup with Vite)
* **Language:** TypeScript (.tsx)
* **Features:** Strict Typing, Interface definition

### Backend
* **Framework:** NestJS
* **Database:** PostgreSQL
* **Infrastructure:** Docker & Docker Compose
* **Authentication:** JWT & Passport

## Features Overview
* **Authentication:** ระบบ Register และ Login โดยมีการแยก Role (Admin/User)
* **Booking Flow:** ผู้ใช้สามารถดูรายการเที่ยวบินและทำการจองได้ (Business Logic)
* **Management:** Admin สามารถจัดการข้อมูลเที่ยวบินได้ (CRUD Operations)

## Project Structure
* `/frontend`: Source code สำหรับ React Application
* `/backend`: Source code สำหรับ NestJS API และไฟล์ docker-compose.yml