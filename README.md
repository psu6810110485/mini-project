# ✈️ Mini-Project: Flight Booking System (SKY WINGS)

## 📖 Project Description
ระบบเว็บแอปพลิเคชันสำหรับการจองตั๋วเครื่องบิน (Flight Booking System) พัฒนาขึ้นเพื่อเป็นส่วนหนึ่งของวิชา **Full Stack Web Application Development** ระบบนี้เชื่อมต่อระหว่าง Frontend และ Backend ผ่าน RESTful API โดยรองรับการทำงานของผู้ใช้งาน 2 ระดับ คือ **User** (สำหรับการจอง) และ **Admin** (สำหรับการจัดการระบบ)

---

## 👥 Group Members
| รหัสนักศึกษา | ชื่อ-สกุล | Role |
| :--- | :--- | :--- |
| **6810110485** | พัสกร เพิ่มผล | Developer |
| **6810110571** | ชิษณุ แซ่เลี่ยง | Developer |

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React (setup with Vite)
- **Language:** TypeScript (`.tsx`)
- **Features:** Strict Typing, Interface definition, Axios Interceptor

### Backend
- **Framework:** NestJS
- **Database:** PostgreSQL
- **Infrastructure:** Docker & Docker Compose
- **Authentication:** JWT, Passport, Bcrypt
- **ORM:** TypeORM (Entity Relations & Optimistic Locking)

---

## 🚀 Features Overview

### 🔐 Authentication
- ระบบ **Register** (Hash Password) และ **Login** (JWT)
- มีการแยก **Role** ชัดเจน: `ADMIN` (Full Access) และ `USER` (Read & Interact)

### 🎫 Booking Flow (User)
- ผู้ใช้สามารถค้นหาและดูรายการเที่ยวบินได้
- **Business Logic:** ระบบตัด Stock ที่นั่งทันที และป้องกันการจองซ้อนด้วย **Optimistic Lock**

### ⚙️ Management (Admin)
- Admin มีสิทธิ์จัดการข้อมูลเที่ยวบิน (CRUD Operations: เพิ่ม/ลบ/แก้ไข)
- User ทั่วไปจะไม่เห็นปุ่มจัดการเหล่านี้

---

## 📂 Project Structure
- `/frontend`: Source code สำหรับ React Application
- `/backend`: Source code สำหรับ NestJS API และไฟล์ `docker-compose.yml`
