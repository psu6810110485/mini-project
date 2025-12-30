import { useMemo, useState, useEffect } from 'react'
import type { Booking, BookingStatus, Flight, ID, IsoDateTimeString } from '../types'

type BookingPanelProps = {
  userId: ID
  flight: Flight
  onBooked: (booking: Booking) => void
}

function computeTotalPrice(price: number | string, seatCount: number): number {
  return Number(price) * seatCount
}

function nowIso(): IsoDateTimeString {
  return new Date().toISOString()
}

// ✅ เปลี่ยนเป็น export default เพื่อให้ App.tsx เรียกใช้ได้ถูกต้อง
export default function BookingPanel({ userId, flight, onBooked }: BookingPanelProps) {
  const [seatCount, setSeatCount] = useState<number>(1)
  const [status, setStatus] = useState<BookingStatus>('pending')

  // รีเซ็ตเมื่อเปลี่ยนเที่ยวบินใหม่
  useEffect(() => {
    setSeatCount(1);
    setStatus('pending');
  }, [flight]);

  // ✅ แก้: ใช้ available_seats (snake_case)
  const maxSeats = Math.max(0, flight.available_seats)

  const totalPrice = useMemo(() => {
    const normalizedSeats = Math.min(Math.max(seatCount, 1), Math.max(maxSeats, 1))
    // ✅ แก้: แปลง price เป็น Number เสมอกันเหนียว
    return computeTotalPrice(flight.price, normalizedSeats)
  }, [flight.price, maxSeats, seatCount])

  function handleSeatChange(value: number) {
    const next = Number.isFinite(value) ? value : 1
    setSeatCount(Math.min(Math.max(next, 1), Math.max(maxSeats, 1)))
  }

  function handleBook() {
    if (maxSeats <= 0) return

    // ✅ แก้: สร้าง Object Booking ให้เป็น snake_case ตาม types.ts
    const booking: Booking = {
      booking_id: Date.now(),
      user_id: userId,
      flight_id: flight.flight_id, // snake_case
      seat_count: Math.min(Math.max(seatCount, 1), Math.max(maxSeats, 1)),
      total_price: totalPrice,
      status: 'confirmed',
      booking_time: nowIso(),
    }

    setStatus('confirmed')
    onBooked(booking)
  }

  return (
    <section aria-label="booking-panel" className="glass-panel" style={{ textAlign: 'left', padding: '25px' }}>
      <h2 style={{ marginTop: 0, fontFamily: 'Chonburi', color: 'var(--rich-gold)' }}>จองเที่ยวบิน</h2>
      
      <div style={{ display: 'grid', gap: 15 }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px' }}>
          <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--royal-blue)', fontFamily: 'Chonburi' }}>
            {flight.flight_code} — {flight.origin} ➝ {flight.destination}
          </div>
          <div style={{ fontSize: 14, fontFamily: 'Prompt', marginTop: '5px' }}>
             {/* ✅ แก้: ใช้ travel_date (snake_case) */}
             วันที่: {new Date(flight.travel_date).toLocaleDateString('th-TH', { 
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
             })}
          </div>
        </div>

        {/* ส่วนเลือกที่นั่งพร้อมปุ่ม +/- */}
        <div style={{ fontFamily: 'Prompt' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>จำนวนที่นั่ง</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
                type="button"
                onClick={() => handleSeatChange(seatCount - 1)}
                disabled={seatCount <= 1}
                style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer' }}
            >-</button>

            <input
              type="number"
              min={1}
              max={Math.max(maxSeats, 1)}
              value={seatCount}
              onChange={(e) => handleSeatChange(e.target.valueAsNumber)}
              style={{ 
                  width: '60px', textAlign: 'center', fontSize: '1.2rem', 
                  fontWeight: 'bold', margin: 0, borderRadius: '8px' 
              }}
            />

            <button 
                type="button"
                onClick={() => handleSeatChange(seatCount + 1)}
                disabled={seatCount >= maxSeats}
                style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer' }}
            >+</button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            ว่าง: {flight.available_seats} ที่นั่ง
          </p>
        </div>

        <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <div style={{ fontFamily: 'Prompt' }}>ราคารวม:</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-green)', fontFamily: 'Prompt' }}>
                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPrice)}
            </div>
        </div>

        <div>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleBook} 
            disabled={maxSeats <= 0}
            style={{ width: '100%', marginTop: '10px' }}
          >
            ยืนยันการจอง
          </button>
        </div>
      </div>
    </section>
  )
}