// frontend/src/types.ts

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

// ---------- Domain Models (เปลี่ยนเป็น snake_case ให้ตรงกับ DB) ----------

export interface User {
  user_id: ID;       // ✅ แก้จาก userId
  name: string;
  email: string;
  role: UserRole;
}

export interface Flight {
  flight_id: ID;           // ✅ แก้จาก flightId
  flight_code: string;     // ✅ แก้จาก flightCode
  origin: string;
  destination: string;
  travel_date: IsoDateTimeString; // ✅ แก้จาก travelDate (สำคัญมาก!)
  price: number | string;  // รองรับทั้ง string/number กันเหนียว
  available_seats: number; // ✅ แก้จาก availableSeats
  status: 'Active' | 'Cancelled' | string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  booking_id: ID;    // ✅ แก้จาก bookingId
  user_id: ID;       // ✅ แก้จาก userId
  flight_id: ID;     // ✅ แก้จาก flightId
  seat_count: number;// ✅ แก้จาก seatCount
  total_price: number;// ✅ แก้จาก totalPrice
  status: BookingStatus;
  booking_time: IsoDateTimeString; // ✅ แก้จาก bookingTime
}

// ---------- UI / Frontend-Specific Types ----------
export interface FlightSearchParams {
  origin?: string
  destination?: string
  travelDate?: string // อันนี้เป็น State ของฟอร์ม เก็บไว้แบบเดิมได้
}

export interface CreateBookingRequest {
  flight_id: ID;     // ✅ แก้ให้ตรง Backend
  seat_count: number;// ✅ แก้ให้ตรง Backend
}