import { useState, useEffect } from 'react'
import type { Booking, Flight, ID } from '../types'

type BookingPanelProps = {
  userId: ID
  flight: Flight
  onBooked: (booking: Booking) => void
}

// ✅ Helper Functions
function computeTotalPrice(price: number | string, seatCount: number): number {
  return Number(price) * Number(seatCount) // 👈 ใส่ Number() ครอบทั้งคู่ แก้ Error คณิตศาสตร์
}

function nowIso(): string {
  return new Date().toISOString()
}

export default function BookingPanel({ userId, flight, onBooked }: BookingPanelProps) {
  const [seatCount, setSeatCount] = useState<number>(1)
  const [isBooked, setIsBooked] = useState(false)

  // รีเซ็ตเมื่อเปลี่ยนเที่ยวบิน
  useEffect(() => {
    setSeatCount(1);
    setIsBooked(false)
  }, [flight]);

  const maxSeats = Math.max(0, Number(flight.available_seats)) // 👈 ใส่ Number() กันเหนียว

  // คำนวณราคารวม (ไม่ต้องใช้ useMemo ก็ได้ ถ้าไม่ได้คำนวณหนักมาก)
  const totalPrice = computeTotalPrice(flight.price, seatCount)

  function handleSeatChange(value: number) {
    const next = Number.isFinite(value) ? value : 1
    setSeatCount(Math.min(Math.max(next, 1), Math.max(maxSeats, 1)))
  }

  function handleBook() {
    if (maxSeats <= 0) return

    const booking: Booking = {
      booking_id: Date.now(),
      user_id: userId,
      flight_id: flight.flight_id,
      seat_count: Math.min(Math.max(seatCount, 1), Math.max(maxSeats, 1)),
      total_price: totalPrice,
      // ✅ แก้ไข: เปลี่ยนเป็นตัวพิมพ์เล็ก 'confirmed' ให้ตรงกับไฟล์ types.ts
      status: 'confirmed', 
      booking_time: nowIso(),
    }

    onBooked(booking)
    setIsBooked(true)
  }

  return (
    <section aria-label="booking-panel" className="glass-panel" style={{ textAlign: 'left', padding: '30px', borderTop: '5px solid var(--rich-gold)' }}>
      {/* ส่วนหัวข้อ */}
      <h2 style={{ marginTop: 0, fontFamily: 'Chonburi', color: 'var(--rich-gold)', borderBottom: '1px dashed rgba(255,255,255,0.3)', paddingBottom: '15px' }}>
        🎫 จองเที่ยวบิน
      </h2>
      
      <div style={{ display: 'grid', gap: 15 }}>
        {/* รายละเอียดเที่ยวบิน */}
        <div style={{ paddingBottom: '15px', fontFamily: 'Prompt' }}>
          <div style={{ fontWeight: 600, fontSize: '1.4rem', color: '#fff', fontFamily: 'Chonburi', marginBottom: '5px' }}>
            {flight.flight_code}
          </div>
          <div style={{ fontSize: '1.1rem', color: '#ddd' }}>
             {flight.origin} ➝ {flight.destination}
          </div>
          <div style={{ fontSize: 14, marginTop: '8px', color: '#aaa' }}>
             📅 วันที่: {flight.travel_date ? new Date(flight.travel_date).toLocaleDateString('th-TH', { 
                day: 'numeric', month: 'long', year: 'numeric'
             }) : 'ระบุวันเดินทาง'}
          </div>
        </div>

        {/* ส่วนเลือกที่นั่ง */}
        <div style={{ fontFamily: 'Prompt', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
             <label style={{ display: 'block', color: '#fff' }}>จำนวนที่นั่ง</label>
             <span style={{ fontSize: '0.9rem', color: '#aaa' }}>ว่าง: {flight.available_seats}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <button 
                type="button"
                onClick={() => handleSeatChange(seatCount - 1)}
                disabled={seatCount <= 1}
                style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}
            >-</button>

            <input
              type="number"
              min={1}
              max={Math.max(maxSeats, 1)}
              value={seatCount}
              onChange={(e) => handleSeatChange(e.target.valueAsNumber)}
              className="seat-count-input"
              style={{ 
                  width: '60px', textAlign: 'center', fontSize: '1.2rem', 
                  fontWeight: 'bold', margin: 0, borderRadius: '8px',
                  height: '40px', border: 'none'
              }}
            />

            <button 
                type="button"
                onClick={() => handleSeatChange(seatCount + 1)}
                disabled={seatCount >= maxSeats}
                style={{ width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}
            >+</button>
          </div>
        </div>

        {/* ส่วนราคารวม */}
        <div style={{ textAlign: 'right', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
            <div style={{ fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>ราคารวมสุทธิ</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--success-green)', fontFamily: 'Prompt', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPrice)}
            </div>
        </div>

        {/* ปุ่มยืนยัน */}
        <div>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleBook} 
            disabled={maxSeats <= 0}
            style={{ width: '100%', marginTop: '10px', fontSize: '1.2rem', padding: '15px' }}
          >
            ยืนยันการจอง
          </button>

          {isBooked && (
            <div
              role="status"
              aria-live="polite"
              style={{
                marginTop: 15,
                padding: '15px',
                borderRadius: 12,
                border: '1px solid var(--success-green)',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                color: '#fff',
                fontFamily: 'Prompt',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              ✅ จองสำเร็จแล้ว!
            </div>
          )}
        </div>
      </div>
    </section>
  )
}