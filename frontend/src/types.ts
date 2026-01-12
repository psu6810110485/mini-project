// frontend/src/types.ts

// ===============================
// ---------- Basic Types ----------
// ===============================

// ID = ใช้แทนเลข id ของ entity ต่างๆ
export type ID = number

// ISO DateTime String = ตัวแปรเก็บวันที่-เวลาเป็น string ตามมาตรฐาน ISO
export type IsoDateTimeString = string

// ApiResponse = โครงสร้างมาตรฐานสำหรับ response ของ API (Response = ข้อมูลที่ Backend ส่งกลับไปให้ Frontend หลังจาก Frontend ทำการเรียก API)
export type ApiResponse<TData> = { 
  data: TData              // ข้อมูลหลัก
  message?: string         // ข้อความเพิ่มเติม (ไม่บังคับ)
}

// ApiError = โครงสร้าง error จาก API
export type ApiError = {
  message: string          // ข้อความ error
  code?: string            // รหัส error (optional)
  details?: unknown        // ข้อมูลเพิ่มเติมเกี่ยวกับ error
}

// ===============================
// ---------- Auth & Roles ----------
// ===============================

// UserRole = จำกัดสิทธิ์ผู้ใช้ ให้ชัดเจน (Type Safety)
export type UserRole = 'ADMIN' | 'USER'

// AuthToken = string ของ JWT Token
export type AuthToken = string

// AuthResponse = response หลัง login / register
// AuthResponse คือ โครงสร้างของข้อมูลที่ API ส่งกลับหลังจากผู้ใช้ทำ Login หรือ Register สำเร็จ (ก็คือส่งไปยังหน้าบ้าน)

 //interface ใน TypeScript คือ สัญญาหรือโครงสร้างของข้อมูล

export interface AuthResponse {
  token: AuthToken         // JWT Token และ AuthToke ก็คือ str
  user: User               // ข้อมูลผู้ใช้ และ ภายในจะมีข้อมูล เช่น userId, name, email, role
}

// LoginRequest = ข้อมูลที่ส่งไปตอน login
export interface LoginRequest {
  email: string
  password: string
}

// RegisterRequest = ข้อมูลที่ส่งไปตอน register
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

// ===============================
// ---------- Domain Models ----------
// ===============================

// User Interface
// รองรับทั้ง camelCase (frontend) และ snake_case (backend)
export interface User {
  user_id?: ID;       // snake_case จาก DB คือ (เขียนคำติดกันโดย ใช้ _ คั่นคำ)
  userId?: ID;        // camelCase จาก Backend service คือ (camelCase (frontend) และ snake_case )
  name: string
  email: string
  role: UserRole
}

// Flight Interface
export interface Flight {
  flight_id: ID;                    // ID ของเที่ยวบิน
  flight_code: string;              // รหัสเที่ยวบิน
  origin: string                    // ต้นทาง
  destination: string               // ปลายทาง
  travel_date: IsoDateTimeString    // วันที่เดินทาง
  price: number | string            // ราคาตั๋ว รองรับ number/string กันเหนียว
  available_seats: number           // จำนวนที่นั่งว่าง
  status: 'Active' | 'Cancelled' | string // สถานะเที่ยวบิน
}

// Booking Status Enum (Type Safety)
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' // การกำหนดสถานะใหม่ รอดำเนินการ คอนเฟริม ยกเลิก 

// Booking Interface
export interface Booking {
  booking_id: ID;               // ID ของ Booking
  user_id: ID;                  // ID ของผู้ใช้
  flight_id: ID;                // ID ของเที่ยวบิน
  seat_count: number;           // จำนวนที่นั่งที่จอง
  total_price: number;          // ราคาทั้งหมด
  status: BookingStatus;        // สถานะการจอง
  booking_time: IsoDateTimeString // เวลาและวันที่จอง
}

// ===============================
// ---------- UI / Frontend-Specific Types ----------
// ===============================

// FlightSearchParams = เงื่อนไขค้นหาเที่ยวบิน (ฟอร์ม UI)
export interface FlightSearchParams {
  origin?: string
  destination?: string
  travelDate?: string // เก็บเป็น state ของฟอร์ม
}

// CreateBookingRequest = Request body ส่งไปสร้าง booking
export interface CreateBookingRequest {
  flight_id: ID;      // ต้องตรงกับ backend
  seat_count: number; // จำนวนที่นั่งต้องตรงกับ backend
}

/* 
===============================
Type Safety ใน Frontend:
===============================
- TypeScript จะช่วยตรวจสอบประเภทของข้อมูลตั้งแต่เขียนโค้ด (Compile Time)
- ลดข้อผิดพลาดเวลาเรียก API
- ทำให้ editor/IDE แนะนำ auto-complete ได้
- ใช้ type/enum/interface เพื่อให้โค้ดสื่อความหมายชัดเจน
- ตัวอย่าง: 
  Flight.status มีค่าได้แค่ 'Active' | 'Cancelled' | string → ป้องกันใส่ค่าอื่นผิดพลาด
*/
