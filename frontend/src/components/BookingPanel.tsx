import { useState, useEffect } from 'react'
import type { Booking, Flight, ID } from '../types'
import api from '../api/axios'

type BookingPanelProps = {
  userId: ID
  flight: Flight
  onBooked: (booking: Booking) => void
}

function computeTotalPrice(price: number | string, seatCount: number): number {
  return Number(price) * Number(seatCount)
}

function nowIso(): string {
  return new Date().toISOString()
}

export default function BookingPanel({ userId, flight, onBooked }: BookingPanelProps) {
  // --- STATE ---
  const [seatCount, setSeatCount] = useState<number>(1)
  const [isBooked, setIsBooked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  // State สำหรับ Modal
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  // ✅ NEW: State สำหรับเปิดหน้าต่างยืนยันก่อนจอง
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    setSeatCount(1);
    setIsBooked(false)
    setErrorMessage('')
    setLatestBooking(null)
    setShowSuccessModal(false)
    setShowConfirmModal(false)
  }, [flight]);

  const maxSeats = Math.max(0, Number(flight.available_seats))
  const totalPrice = computeTotalPrice(flight.price, seatCount)

  function handleSeatChange(value: number) {
    const next = Number.isFinite(value) ? value : 1
    setSeatCount(Math.min(Math.max(next, 1), Math.max(maxSeats, 1)))
  }

  // ✅ STEP 1: ปุ่มแรกกดแล้วมาที่ฟังก์ชันนี้ (แค่เปิด Modal ยืนยัน)
  function handlePreCheck() {
    if (maxSeats <= 0) {
      setErrorMessage('ไม่มีที่นั่งว่าง')
      return
    }
    setErrorMessage('')
    setShowConfirmModal(true) // เปิดหน้าต่างยืนยัน
  }

  // ✅ STEP 2: ฟังก์ชันจองจริง (จะถูกเรียกเมื่อกด "ยืนยัน" ใน Modal)
  async function processBooking() {
    setShowConfirmModal(false) // ปิดหน้าต่างยืนยัน
    setIsLoading(true)
    setErrorMessage('')

    try {
      console.log('📝 Creating booking for user:', userId)
      
      const response = await api.post('/bookings', {
        flightId: flight.flight_id,
        seatCount: Math.min(Math.max(seatCount, 1), Math.max(maxSeats, 1)),
        totalPrice: totalPrice
      })

      console.log('✅ Booking created successfully:', response.data)

      const booking: Booking = {
        booking_id: response.data.booking_id,
        user_id: userId,
        flight_id: flight.flight_id,
        seat_count: response.data.seat_count,
        total_price: response.data.total_price,
        status: 'confirmed',
        booking_time: response.data.booking_time || nowIso(),
      }

      onBooked(booking)
      setLatestBooking(booking)
      setIsBooked(true)
      setShowSuccessModal(true) // เปิดหน้าต่างสำเร็จ

    } catch (error: any) {
      console.error('❌ Booking failed:', error)
      const errorMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง'
      setErrorMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // --- UI ---
  return (
    <>
      <section 
        aria-label="booking-panel" 
        className="glass-panel" 
        style={{ 
          textAlign: 'left', 
          padding: '30px', 
          borderTop: '5px solid var(--rich-gold)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <h2 style={{ 
          marginTop: 0, fontFamily: 'Chonburi', color: 'var(--rich-gold)', 
          borderBottom: '1px dashed rgba(255,255,255,0.3)', paddingBottom: '15px',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          🎫 จองเที่ยวบิน
        </h2>
        
        <div style={{ display: 'grid', gap: 15 }}>
          {/* ข้อมูลเที่ยวบิน */}
          <div style={{ paddingBottom: '15px', fontFamily: 'Prompt' }}>
            <div style={{ fontWeight: 600, fontSize: '1.6rem', color: '#fff', fontFamily: 'Chonburi', marginBottom: '5px', letterSpacing: '1px' }}>
              {flight.flight_code}
            </div>
            <div style={{ fontSize: '1.1rem', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span>{flight.origin}</span> <span style={{ color: 'var(--rich-gold)' }}>✈</span> <span>{flight.destination}</span>
            </div>
            <div style={{ fontSize: 14, marginTop: '8px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
               📅 {flight.travel_date ? new Date(flight.travel_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'ระบุวันเดินทาง'}
            </div>
          </div>

          {/* ส่วนเลือกที่นั่ง */}
          <div style={{ fontFamily: 'Prompt', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
               <label style={{ display: 'block', color: '#fff', fontWeight: 'bold' }}>จำนวนที่นั่ง</label>
               <span style={{ fontSize: '0.9rem', color: '#87CEFA' }}>ว่าง: {flight.available_seats} ที่นั่ง</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
              <button 
                  type="button" onClick={() => handleSeatChange(seatCount - 1)} disabled={seatCount <= 1 || isLoading}
                  style={{ width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: '#fff', fontWeight: 'bold', fontSize: '1.5rem', color: '#333', transition: '0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
              >-</button>

              <input
                type="number" min={1} max={Math.max(maxSeats, 1)} value={seatCount}
                onChange={(e) => handleSeatChange(e.target.valueAsNumber)} disabled={isLoading}
                style={{ width: '80px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: 0, borderRadius: '10px', height: '45px', border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff' }}
              />

              <button 
                  type="button" onClick={() => handleSeatChange(seatCount + 1)} disabled={seatCount >= maxSeats || isLoading}
                  style={{ width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: '#fff', fontWeight: 'bold', fontSize: '1.5rem', color: '#333', transition: '0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
              >+</button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
              <div style={{ fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>ราคารวมสุทธิ</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2ecc71', fontFamily: 'Prompt', textShadow: '0 0 15px rgba(46, 204, 113, 0.4)' }}>
                  {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPrice)}
              </div>
          </div>

          {errorMessage && (
            <div style={{ padding: '15px', borderRadius: 12, border: '1px solid #dc3545', backgroundColor: 'rgba(220, 53, 69, 0.2)', color: '#fff', fontFamily: 'Prompt', textAlign: 'center', fontWeight: 'bold', animation: 'shake 0.4s ease-in-out' }}>
              ❌ {errorMessage}
            </div>
          )}

          <div>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handlePreCheck}  // ✅ แก้ให้เรียกหน้าตรวจสอบก่อน
              disabled={maxSeats <= 0 || isLoading}
              style={{ 
                width: '100%', marginTop: '10px', fontSize: '1.2rem', padding: '15px',
                borderRadius: '50px', opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? '#666' : 'linear-gradient(90deg, #D4AF37 0%, #C5A028 100%)',
                boxShadow: '0 5px 20px rgba(212, 175, 55, 0.4)', border: 'none', color: '#000', fontWeight: 'bold', transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'จองเที่ยวบิน ✈️'}
            </button>
          </div>
        </div>
      </section>

      {/* 🔴 CONFIRMATION MODAL (หน้าต่างยืนยันการจอง) */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '30px',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '3px solid var(--rich-gold)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <h2 style={{ fontFamily: 'Chonburi', color: '#002b49', marginTop: 0 }}>
              🤔 ยืนยันการจอง?
            </h2>
            <div style={{ fontFamily: 'Prompt', color: '#555', margin: '20px 0', textAlign: 'left', background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
              <div style={{ marginBottom: '8px' }}><strong>เที่ยวบิน:</strong> {flight.flight_code}</div>
              <div style={{ marginBottom: '8px' }}><strong>เส้นทาง:</strong> {flight.origin} ➝ {flight.destination}</div>
              <div style={{ marginBottom: '8px' }}><strong>จำนวน:</strong> {seatCount} ที่นั่ง</div>
              <div style={{ marginTop: '15px', fontSize: '1.2rem', color: '#2ecc71', fontWeight: 'bold', textAlign: 'right' }}>
                รวม: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPrice)}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: '50px', border: '1px solid #ccc',
                  background: 'transparent', color: '#666', fontFamily: 'Prompt', cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={processBooking}
                style={{
                  padding: '10px 30px', borderRadius: '50px', border: 'none',
                  background: '#002b49', color: 'white', fontFamily: 'Prompt', cursor: 'pointer',
                  fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0, 43, 73, 0.3)'
                }}
              >
                ยืนยันการชำระเงิน ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SUCCESS MODAL (หน้าต่างสำเร็จ - อันเดิมของคุณ) */}
      {showSuccessModal && latestBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowSuccessModal(false)}>
          <div style={{
            background: 'linear-gradient(145deg, #0f2027, #203a43, #2c5364)', borderRadius: '25px',
            padding: '50px 60px', maxWidth: '550px', width: '90%',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.8)', border: '2px solid rgba(197, 160, 89, 0.5)',
            textAlign: 'center', color: '#fff', animation: 'slideUp 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)', position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSuccessModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.2rem', color: '#fff', cursor: 'pointer' }}>✕</button>
            <div style={{ width: '110px', height: '110px', margin: '0 auto 25px', background: 'linear-gradient(135deg, #28a745, #20c997)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', boxShadow: '0 0 30px rgba(40, 167, 69, 0.6)', animation: 'bounce 0.8s ease-in-out infinite alternate' }}>✓</div>
            <h1 style={{ fontFamily: 'Chonburi', fontSize: '2.5rem', margin: '0 0 10px', background: 'linear-gradient(to right, #c5a059, #fbd287, #c5a059)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>จองสำเร็จ!</h1>
            <p style={{ fontFamily: 'Prompt', fontSize: '1.1rem', color: '#ccc', marginBottom: '30px' }}>ขอบคุณที่ไว้วางใจให้เราดูแลการเดินทางของคุณ</p>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '15px', padding: '25px', marginBottom: '30px', border: '1px dashed rgba(197, 160, 89, 0.4)', textAlign: 'left' }}>
               <div style={{ display: 'grid', gap: '12px', fontFamily: 'Prompt' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#aaa' }}>Booking ID</span><span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbd287' }}>#{latestBooking.booking_id}</span></div>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#aaa' }}>เที่ยวบิน</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{flight.flight_code}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#aaa' }}>เส้นทาง</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{flight.origin} ➝ {flight.destination}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>ยอดชำระ</span><span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ecc71' }}>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(latestBooking.total_price)}</span></div>
               </div>
            </div>
            <button onClick={() => setShowSuccessModal(false)} style={{ width: '100%', padding: '16px', borderRadius: '50px', border: 'none', background: 'linear-gradient(90deg, #c5a059 0%, #fbd287 100%)', color: '#000', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', fontFamily: 'Prompt', boxShadow: '0 8px 30px rgba(197, 160, 89, 0.3)' }}>ตกลง (OK)</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(100px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>
    </>
  )
}