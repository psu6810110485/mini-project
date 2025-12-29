export type ID = number

// ---------- API helpers ----------
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

// ---------- Auth ----------
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

// ---------- Domain models (camelCase for app state) ----------
export interface User {
  userId: ID
  name: string
  email: string
}

export interface Product {
  productId: ID
  name: string
  price: number
}

export interface Flight {
  flightId: ID
  flightCode: string
  origin: string
  destination: string
  travelDate: IsoDateTimeString
  price: number
  availableSeats: number
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
}

// ---------- DTOs (snake_case for API payloads) ----------
export interface UserDto {
  user_id: ID
  name: string
  email: string
}

export interface FlightDto {
  flight_id: ID
  flight_code: string
  origin: string
  destination: string
  travel_date: IsoDateTimeString
  price: number
  available_seats: number
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

// ---------- UI / Frontend-specific types ----------
export interface FlightSearchParams {
  origin: string
  destination: string
  travelDate: string
}
