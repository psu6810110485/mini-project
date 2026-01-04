// frontend/src/types.ts

// ✅ ใช้ number ให้ตรงกับ Database ID
export type ID = number

// ---------- API Helpers ----------
export type IsoDateTimeString = string

export type ApiResponse<TData> = {
  data: TData
  message?: string
}

export type ApiError = {
  message: string
  code?: string
  details?: unknown
}

// ---------- Auth & Roles ----------
// ✅ แก้ไข: เปลี่ยนเป็น string เพื่อรองรับทั้ง 'admin', 'ADMIN' (แก้ปัญหาตัวแดงใน App.tsx)
export type UserRole = string; 

export type AuthToken = string

export interface AuthResponse {
  token: AuthToken
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

// ---------- Domain Models ----------

// ✅ User Interface รองรับทั้ง camelCase และ snake_case
export interface User {
  user_id?: ID;       // snake_case (จาก TypeScript types)
  userId?: ID;        // camelCase (เผื่อ Backend ส่งมาแบบเก่า)
  name: string;
  email: string;
  role: UserRole;
}

export interface Flight {
  flight_id: ID;           
  flight_code: string;     
  origin: string;
  destination: string;
  travel_date: IsoDateTimeString; 
  price: number | string;  
  available_seats: number; 
  status: 'Active' | 'Cancelled' | string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  booking_id: ID;    
  user_id: ID;       
  flight_id: ID;     
  seat_count: number;
  total_price: number;
  status: BookingStatus;
  booking_time: IsoDateTimeString; 
  // เผื่อ Join ข้อมูลเที่ยวบินมาแสดงในหน้า MyBookings
  flight?: Flight;
}

// ---------- UI / Frontend-Specific Types ----------
export interface FlightSearchParams {
  origin?: string
  destination?: string
  travelDate?: string 
}

export interface CreateBookingRequest {
  flight_id: ID;     
  seat_count: number;
}