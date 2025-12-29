// types.ts

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
export type UserRole = 'ADMIN' | 'USER'

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

// ---------- Domain Models (ใช้ภายใน App - camelCase) ----------
export interface User {
  userId: ID
  name: string
  email: string
  role: UserRole // เพิ่ม Role สำหรับแบ่งสิทธิ์ ADMIN/USER [จากข้อกำหนด Authorization]
}

export interface Flight {
  flightId: ID
  flightCode: string
  origin: string
  destination: string
  travelDate: IsoDateTimeString
  price: number
  availableSeats: number
  status: 'Active' | 'Cancelled' // เพิ่มสถานะเที่ยวบินสำหรับ Admin จัดการ
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  bookingId: ID
  userId: ID
  flightId: ID
  seatCount: number
  totalPrice: number
  status: BookingStatus
  bookingTime: IsoDateTimeString
  // สามารถเพิ่มข้อมูล Flight สั้นๆ เพื่อแสดงในหน้าประวัติการจองได้
  flightDetails?: {
    flightCode: string
    origin: string
    destination: string
  }
}

// ---------- DTOs (Data Transfer Objects - snake_case ตาม API/Database) ----------
// ใช้สำหรับรับข้อมูลจาก NestJS API โดยตรง
export interface UserDto {
  user_id: ID
  name: string
  email: string
  role: UserRole
}

export interface FlightDto {
  flight_id: ID
  flight_code: string
  origin: string
  destination: string
  travel_date: IsoDateTimeString
  price: number
  available_seats: number
  status: string
}

export interface BookingDto {
  booking_id: ID
  user_id: ID
  flight_id: ID
  seat_count: number
  total_price: number
  status: BookingStatus
  booking_time: IsoDateTimeString
}

// ---------- UI / Frontend-Specific Types ----------
export interface FlightSearchParams {
  origin?: string
  destination?: string
  travelDate?: string
}

// ตัวอย่าง Type สำหรับสร้าง Booking ใหม่
export interface CreateBookingRequest {
  flightId: ID
  seatCount: number
}