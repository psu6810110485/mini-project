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
  // =========================================================================
  // --- PART 1: LOGIC & STATE (ส่วนนี้คือ "งานเก่า" ห้ามลบ ห้ามแก้ Logic) ---
  // =========================================================================
  const [seatCount, setSeatCount] = useState<number>(1)
  const [isBooked, setIsBooked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // 🔥 [NEW] State สำหรับควบคุม Modal ยืนยันก่อนจอง
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    setSeatCount(1);
    setIsBooked(false)
    setErrorMessage('')
    setLatestBooking(null)
    setShowSuccessModal(false)
    setShowConfirmModal(false) // Reset confirm modal เมื่อเปลี่ยน Flight
  }, [flight]);

  const maxSeats = Math.max(0, Number(flight.available_seats))
  const totalPrice = computeTotalPrice(flight.price, seatCount)

  function handleSeatChange(value: number) {
    const next = Number.isFinite(value) ? value : 1
    setSeatCount(Math.min(Math.max(next, 1), Math.max(maxSeats, 1)))
  }

  // 🔥 [MODIFIED] ฟังก์ชันที่ 1: เช็คเงื่อนไขเบื้องต้น แล้วเปิด Modal ยืนยัน (แทนที่จะจองเลย)
  function handlePreBook() {
    if (maxSeats <= 0) {
      setErrorMessage('ไม่มีที่นั่งว่าง')
      return
    }
    // เคลียร์ Error เดิมก่อน
    setErrorMessage('')
    // เปิดหน้าต่างยืนยัน (Confirmation Modal)
    setShowConfirmModal(true) 
  }

  // 🔥 [NEW] ฟังก์ชันที่ 2: ทำการจองจริง (เรียก API) จะถูกเรียกเมื่อกดยืนยันใน Modal
  async function handleConfirmedBooking() {
    // ปิด Modal ยืนยันก่อน
    setShowConfirmModal(false)
    
    // เริ่ม Loading
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
      setShowSuccessModal(true)

    } catch (error: any) {
      console.error('❌ Booking failed:', error)
      const errorMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง'
      setErrorMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // =========================================================================
  // --- PART 2: UI RENOVATION (รีโนเวทใหม่ ให้ดูแพงและแก้ปัญหาพื้นหลังจม) ---
  // =========================================================================
  return (
    <>
      <section 
        aria-label="booking-panel" 
        className="glass-panel" 
        style={{ 
          textAlign: 'left', 
          padding: '35px', 
          // 🔥 แก้ปัญหาพื้นหลังกินสี: ใช้พื้นหลังสีมืดเข้ม (Dark Obsidian) 
          // ความเข้ม 0.85 จะช่วยบังภาพพื้นหลังที่รกๆ ได้ดีมาก
          background: 'rgba(15, 23, 42, 0.85)', 
          backdropFilter: 'blur(20px)', 
          borderTop: '4px solid #D4AF37', // เพิ่มเส้นทองด้านบน
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' // เงาลึกขึ้นให้ดูลอยออกมา
        }}
      >
        {/* --- Header Section --- */}
        <h2 style={{ 
          marginTop: 0, 
          fontFamily: 'Chonburi', 
          color: '#D4AF37', // สีทองชัดเจน
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)', 
          paddingBottom: '20px',
          marginBottom: '25px',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '1.8rem'
        }}>
          <span style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }}>🎫</span> 
          <span>จองเที่ยวบิน</span>
        </h2>
        
        <div style={{ display: 'grid', gap: 25 }}>
          
          {/* --- Flight Info Card (แยกส่วนข้อมูลเที่ยวบินให้ชัดเจน) --- */}
          <div style={{ 
              padding: '20px', 
              fontFamily: 'Prompt',
              // ใส่พื้นหลังแยกอีกชั้น เพื่อแก้ปัญหา Text จม อย่างสมบูรณ์แบบ
              background: 'rgba(0, 0, 0, 0.4)', 
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: '2rem', // ขยายใหญ่ขึ้น
                      color: '#fff', 
                      fontFamily: 'Chonburi', 
                      marginBottom: '8px',
                      letterSpacing: '2px',
                      textShadow: '0 4px 12px rgba(0,0,0,0.8)' // เงาตัวหนังสือเข้มๆ
                    }}>
                      {flight.flight_code}
                    </div>
                    <div style={{ fontSize: 14, color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <span>เที่ยวบินตรง</span> • <span>ชั้นประหยัด</span>
                    </div>
                </div>
                
                {/* Route Display */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
                       <span style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>{flight.origin}</span> 
                       <span style={{ color: '#D4AF37', fontSize: '1.2rem' }}>✈</span> 
                       <span style={{ textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>{flight.destination}</span>
                    </div>
                    <div style={{ fontSize: 14, marginTop: '5px', color: '#ccc' }}>
                       📅 {flight.travel_date ? new Date(flight.travel_date).toLocaleDateString('th-TH', { 
                         day: 'numeric', month: 'short', year: 'numeric'
                       }) : '-'}
                    </div>
                </div>
            </div>
          </div>

          {/* --- Seat Selection (UI ปรับปรุง) --- */}
          <div style={{ 
            fontFamily: 'Prompt', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '25px', 
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <label style={{ display: 'block', color: '#e0e0e0', fontWeight: 'bold', fontSize: '1.1rem' }}>จำนวนผู้โดยสาร</label>
               <span style={{ fontSize: '0.9rem', color: '#87CEFA', background: 'rgba(135, 206, 250, 0.15)', padding: '6px 15px', borderRadius: '30px', border: '1px solid rgba(135, 206, 250, 0.3)' }}>
                 ว่าง: {flight.available_seats} ที่นั่ง
               </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
              <button 
                  type="button"
                  onClick={() => handleSeatChange(seatCount - 1)}
                  disabled={seatCount <= 1 || isLoading}
                  style={{ 
                    width: '55px', height: '55px', borderRadius: '14px', cursor: 'pointer', border: 'none', 
                    background: seatCount <= 1 ? '#333' : '#fff', 
                    fontWeight: 'bold', fontSize: '1.8rem', color: seatCount <= 1 ? '#666' : '#111',
                    transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => !isLoading && seatCount > 1 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
              >-</button>

              <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(maxSeats, 1)}
                    value={seatCount}
                    onChange={(e) => handleSeatChange(e.target.valueAsNumber)}
                    disabled={isLoading}
                    style={{ 
                        width: '100px', textAlign: 'center', fontSize: '2.2rem', 
                        fontWeight: 'bold', margin: 0, borderRadius: '16px',
                        height: '65px', 
                        border: '2px solid #D4AF37', // ขอบทอง
                        background: 'rgba(0,0,0,0.3)', color: '#fff',
                        fontFamily: 'Chonburi',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                    }}
                  />
                  <span style={{ position: 'absolute', bottom: '-20px', left: '0', right: '0', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>คน</span>
              </div>

              <button 
                  type="button"
                  onClick={() => handleSeatChange(seatCount + 1)}
                  disabled={seatCount >= maxSeats || isLoading}
                  style={{ 
                    width: '55px', height: '55px', borderRadius: '14px', cursor: 'pointer', border: 'none', 
                    background: seatCount >= maxSeats ? '#333' : '#fff',
                    fontWeight: 'bold', fontSize: '1.8rem', color: seatCount >= maxSeats ? '#666' : '#111',
                    transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => !isLoading && seatCount < maxSeats && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
              >+</button>
            </div>
          </div>

          {/* --- Price & Action Button --- */}
          <div style={{ marginTop: '10px', paddingTop: '25px', borderTop: '2px dashed rgba(255,255,255,0.1)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div style={{ fontFamily: 'Prompt', color: '#ccc', fontSize: '1.1rem' }}>ราคาสุทธิ</div>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: '800', 
                  color: '#2ecc71', // เขียวสว่าง
                  fontFamily: 'Prompt', 
                  lineHeight: 1,
                  textShadow: '0 0 25px rgba(46, 204, 113, 0.4)', // Effect เรืองแสง
                  letterSpacing: '-1px'
                }}>
                    {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPrice)}
                </div>
             </div>

             {errorMessage && (
                <div role="alert" style={{ padding: '15px', borderRadius: 12, border: '1px solid #dc3545', backgroundColor: 'rgba(220, 53, 69, 0.2)', color: '#ff6b6b', fontFamily: 'Prompt', textAlign: 'center', fontWeight: 'bold', animation: 'shake 0.4s ease-in-out', marginBottom: '20px' }}>
                  ⚠️ {errorMessage}
                </div>
              )}

             {/* 🔥 ปุ่มนี้เปลี่ยนไปเรียก handlePreBook เพื่อเปิด Confirmation Modal แทน */}
             <button 
               type="button" 
               className="btn-primary" 
               onClick={handlePreBook} 
               disabled={maxSeats <= 0 || isLoading}
               style={{ 
                 width: '100%', 
                 fontSize: '1.4rem', 
                 padding: '20px',
                 borderRadius: '50px',
                 opacity: isLoading ? 0.7 : 1,
                 cursor: isLoading ? 'not-allowed' : 'pointer',
                 // ใช้ Gradient ทองแบบ Premium Gold
                 background: isLoading ? '#666' : 'linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)', 
                 backgroundSize: '200% auto',
                 boxShadow: '0 10px 30px rgba(170, 119, 28, 0.5)',
                 border: 'none',
                 color: '#3d2b05', // Text สีน้ำตาลเข้ม
                 fontWeight: '800',
                 fontFamily: 'Prompt',
                 letterSpacing: '1px',
                 transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                 position: 'relative', 
                 overflow: 'hidden'
               }}
               onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundPosition = 'right center')}
               onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundPosition = 'left center')}
             >
               {isLoading ? (
                 <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                   <span className="loader"></span> กำลังดำเนินการ...
                 </span>
               ) : (
                 <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                   ยืนยันการจอง <span style={{ fontSize: '1.6rem' }}>✈️</span>
                 </span>
               )}
             </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 🔥 [NEW] CONFIRMATION MODAL (หน้าต่างยืนยันก่อนจอง) 🔥 */}
      {/* ===================================================================== */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            animation: 'fadeIn 0.3s ease-out', padding: '20px'
          }}
          onClick={() => setShowConfirmModal(false)}
        >
           <div
             style={{
               background: 'linear-gradient(145deg, #1e1e2f, #252540)',
               borderRadius: '20px',
               padding: '30px',
               maxWidth: '400px', width: '100%',
               border: '1px solid rgba(212, 175, 55, 0.3)',
               boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
               textAlign: 'center',
               animation: 'bounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
             }}
             onClick={(e) => e.stopPropagation()}
           >
             <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🤔</div>
             <h2 style={{ fontFamily: 'Prompt', color: '#fff', margin: '0 0 10px', fontSize: '1.5rem' }}>ยืนยันการจอง?</h2>
             <p style={{ fontFamily: 'Prompt', color: '#aaa', marginBottom: '25px', fontSize: '1rem' }}>
               คุณต้องการยืนยันการจองตั๋วจำนวน <strong>{seatCount}</strong> ที่นั่ง <br/>
               ราคารวม <strong style={{ color: '#2ecc71' }}>{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPrice)}</strong> ใช่หรือไม่?
             </p>

             <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
               <button
                 onClick={() => setShowConfirmModal(false)}
                 style={{
                    padding: '12px 25px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent', color: '#ccc', fontFamily: 'Prompt', cursor: 'pointer',
                    fontSize: '1rem', transition: '0.2s'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                 onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
               >
                 ยกเลิก
               </button>
               <button
                 onClick={handleConfirmedBooking}
                 style={{
                    padding: '12px 30px', borderRadius: '30px', border: 'none',
                    background: 'linear-gradient(90deg, #D4AF37, #AA771C)', 
                    color: '#000', fontFamily: 'Prompt', fontWeight: 'bold', cursor: 'pointer',
                    fontSize: '1rem', transition: '0.2s', boxShadow: '0 5px 15px rgba(212, 175, 55, 0.3)'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
               >
                 ยืนยัน!
               </button>
             </div>
           </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 🔥 PREMIUM BOARDING PASS SUCCESS MODAL (แก้จากกล่องเขียวที่ดู "กาก") 🔥 */}
      {/* ===================================================================== */}
      {showSuccessModal && latestBooking && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.92)', // พื้นหลังมืดสนิทเน้นตั๋ว
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            animation: 'fadeIn 0.5s ease-out', padding: '20px'
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            style={{
              // Design เป็น Boarding Pass รูปทรงตั๋ว
              background: 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', // Gradient น้ำเงินเข้ม-ดำ
              borderRadius: '24px',
              maxWidth: '550px', width: '100%',
              boxShadow: '0 40px 80px rgba(0, 0, 0, 1)', // เงาลอยสูง
              border: '2px solid rgba(197, 160, 89, 0.5)', // ขอบทอง
              position: 'relative',
              animation: 'slideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)', // เด้งดึ๋งสวยๆ
              overflow: 'hidden',
              color: '#fff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- Section บน: Header Success --- */}
            <div style={{ padding: '45px 40px 30px', textAlign: 'center', background: 'rgba(197, 160, 89, 0.08)' }}>
                <div style={{ 
                  width: '100px', height: '100px', margin: '0 auto 25px',
                  background: 'linear-gradient(135deg, #28a745, #20c997)', // เขียว Gradient
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3.5rem', boxShadow: '0 0 50px rgba(40, 167, 69, 0.6)', // เรืองแสงเขียว
                  animation: 'bounce 1s ease-in-out infinite alternate'
                }}>✓</div>
                
                <h1 style={{ 
                  fontFamily: 'Chonburi', fontSize: '3rem', margin: '0 0 10px', 
                  background: 'linear-gradient(to right, #c5a059, #fbd287, #c5a059)', // Text ทองไล่เฉด
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
                }}>
                  จองสำเร็จ!
                </h1>
                <p style={{ fontFamily: 'Prompt', fontSize: '1.2rem', color: '#cfd8dc' }}>
                  การเดินทางของคุณพร้อมแล้ว
                </p>
            </div>

            {/* --- Ticket Stub Divider (รอยประฉีกตั๋ว) --- */}
            <div style={{ 
                height: '30px', 
                background: '#0f2027', // สีเดียวกับพื้นหลัง modal ส่วนล่าง
                position: 'relative',
                // สร้างลายจุดรอยประ
                backgroundImage: 'radial-gradient(circle at 10px 15px, #000 6px, transparent 7px)',
                backgroundSize: '20px 30px',
                backgroundPosition: '-10px 0px',
                borderTop: '2px dashed rgba(197, 160, 89, 0.3)',
                margin: '0 25px',
                opacity: 0.8
            }}></div>

            {/* --- Section ล่าง: Ticket Details --- */}
            <div style={{ padding: '30px 45px 50px', fontFamily: 'Prompt' }}>
               {/* Booking ID Row */}
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                   <div>
                       <div style={{ color: '#90a4ae', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Booking Ref</div>
                       <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fbd287', letterSpacing: '2px', fontFamily: 'monospace' }}>
                         #{latestBooking.booking_id}
                       </div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                       <div style={{ color: '#90a4ae', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Flight</div>
                       <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>
                         {flight.flight_code}
                       </div>
                   </div>
               </div>

               {/* Route Row (Large) */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '30px 0' }}>
                   <div style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: '2.8rem', fontWeight: '900', fontFamily: 'Chonburi', lineHeight: 1 }}>{flight.origin}</div>
                   </div>
                   <div style={{ fontSize: '2rem', color: '#fbd287', transform: 'rotate(0deg)' }}>✈✈✈</div>
                   <div style={{ textAlign: 'center' }}>
                       <div style={{ fontSize: '2.8rem', fontWeight: '900', fontFamily: 'Chonburi', lineHeight: 1 }}>{flight.destination}</div>
                   </div>
               </div>

               {/* Details Footer */}
               <div style={{ 
                 background: 'rgba(255,255,255,0.06)', 
                 borderRadius: '16px', 
                 padding: '25px', 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center',
                 border: '1px solid rgba(255,255,255,0.05)'
               }}>
                   <div>
                       <div style={{ color: '#90a4ae', fontSize: '0.9rem' }}>ผู้โดยสาร</div>
                       <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{latestBooking.seat_count} ท่าน</div>
                   </div>
                   <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.2)' }}></div>
                   <div style={{ textAlign: 'right' }}>
                       <div style={{ color: '#90a4ae', fontSize: '0.9rem' }}>ยอดชำระรวม</div>
                       <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2ecc71', textShadow: '0 0 10px rgba(46, 204, 113, 0.4)' }}>
                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(latestBooking.total_price)}
                       </div>
                   </div>
               </div>
            </div>

            {/* ปุ่มปิด (X) */}
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%',
                width: '40px', height: '40px', fontSize: '1.2rem', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >✕</button>
          </div>

          {/* Style for Animations */}
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(100px) scale(0.8); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            .loader { border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #2c1e05; border-radius: 50%; width: 22px; height: 22px; animation: spin 0.8s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}
    </>
  )
}