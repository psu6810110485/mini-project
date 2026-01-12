// frontend/src/pages/MyBookings.tsx

import { useState, useEffect } from 'react'
import api from '../api/axios'
import type { Booking, ID } from '../types'

interface MyBookingsProps { // Props ของ Component สิ่งที่ต้องการ
  userId: ID 
  onClose: () => void // ฟังก์ชันปิด Modal
}

interface BookingWithFlight extends Booking {
  flight?: {
    flight_code: string
    origin: string
    destination: string
    travel_date: string
  }
}

export default function MyBookings({ userId, onClose }: MyBookingsProps) {
  // --- STATE เดิม (ห้ามลบ) ---
  const [bookings, setBookings] = useState<BookingWithFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔥 [NEW] เพิ่ม State สำหรับควบคุม Modal ยกเลิกแบบ Premium
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingIdToCancel, setBookingIdToCancel] = useState<ID | null>(null)

  useEffect(() => {
    console.log('🎯 MyBookings Component mounted with userId:', userId);
    console.log('🔐 Current token:', localStorage.getItem('token')?.substring(0, 30) + '...');
    fetchBookings()
  }, [userId])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📡 Fetching bookings for userId:', userId);
      
      // ✅ เรียก API ดึงประวัติการจอง
      const response = await api.get<BookingWithFlight[]>(`/bookings/user/${userId}`)
      
      console.log('✅ Bookings fetched successfully:', response.data);
      console.log('📊 Total bookings:', response.data.length);
      
      setBookings(response.data)
    } catch (err: any) {
      console.error('❌ Failed to fetch bookings:', err);
      console.error('📄 Error response:', err.response?.data);
      console.error('🔢 Status code:', err.response?.status);
      
      setError(err.response?.data?.message || 'ไม่สามารถโหลดประวัติการจองได้')
    } finally {
      setLoading(false)
    }
  }

  // 🔥 [NEW FUNCTION] ฟังก์ชัน 1: กดปุ่มกากบาท -> แค่เปิด Modal ถาม (ยังไม่ลบจริง)
  const handleRequestCancel = (bookingId: ID) => {
    setBookingIdToCancel(bookingId) // จำ ID ไว้
    setShowCancelModal(true)        // เปิด Modal
  }

  // 🔥 [UPDATED FUNCTION] ฟังก์ชัน 2: ยืนยันการลบจริง (ย้าย Logic เดิมมาไว้ตรงนี้)
  const handleConfirmCancel = async () => {
    // ปิด Modal ก่อน
    setShowCancelModal(false)

    // Safety check
    if (!bookingIdToCancel) return

    // --- LOGIC เดิมของคุณ (เริ่ม) ---
    try {
      console.log('🔄 Cancelling booking:', bookingIdToCancel);
      
      // เรียก API
      await api.patch(`/bookings/${bookingIdToCancel}`, { status: 'cancelled' })
      
      console.log('✅ Booking cancelled successfully');
      
      // ✅ อัปเดต State (Logic เดิม)
      setBookings(prev => 
        prev.map(b => 
          b.booking_id === bookingIdToCancel 
            ? { ...b, status: 'cancelled' } 
            : b
        )
      )
      
      // alert('✅ ยกเลิกการจองสำเร็จ') // (Optional: Comment ไว้เพราะ Modal สื่อสารชัดเจนแล้ว)
    } catch (err: any) {
      console.error('❌ Failed to cancel booking:', err)
      alert('ยกเลิกการจองไม่สำเร็จ: ' + (err.response?.data?.message || 'เกิดข้อผิดพลาด'))
    } finally {
      // Reset ID
      setBookingIdToCancel(null)
    }
    // --- LOGIC เดิมของคุณ (จบ) ---
  }

  return (
    <>
      {/* Overlay หลัก */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9998,
          backdropFilter: 'blur(5px)'
        }}
      />

      {/* Modal แสดงรายการจอง (ตัวเดิม) */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        maxWidth: '900px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '25px 30px',
          borderBottom: '2px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '2rem' }}>📋</span>
            <h2 style={{ 
              margin: 0, 
              fontFamily: 'Chonburi', 
              color: '#0D253F',
              fontSize: '1.8rem'
            }}>
              ประวัติการจอง
            </h2>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0D253F',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '30px' 
        }}>
          
          {/* Loading State */}
          {loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              fontFamily: 'Prompt',
              color: '#888'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
              <div style={{ fontSize: '1.2rem' }}>กำลังโหลดข้อมูล...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              fontFamily: 'Prompt'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
              <div style={{ fontSize: '1.2rem', color: '#ff4d4f', marginBottom: '20px' }}>
                {error}
              </div>
              <button
                onClick={fetchBookings}
                style={{
                  padding: '12px 30px',
                  borderRadius: '50px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)',
                  color: '#0D253F',
                  fontFamily: 'Prompt',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && bookings.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              fontFamily: 'Prompt',
              color: '#888'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🎫</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                ยังไม่มีประวัติการจอง
              </h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                เมื่อคุณจองตั๋วเครื่องบิน ประวัติจะแสดงที่นี่
              </p>
            </div>
          )}

          {/* Bookings List */}
          {!loading && !error && bookings.length > 0 && (
            <div style={{ display: 'grid', gap: '20px' }}>
              {bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  style={{
                    border: '2px solid #f0f0f0',
                    borderRadius: '15px',
                    padding: '20px',
                    background: booking.status === 'cancelled' 
                      ? 'rgba(255, 77, 79, 0.05)' 
                      : 'rgba(212, 175, 55, 0.05)',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    padding: '6px 15px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontFamily: 'Prompt',
                    fontWeight: 'bold',
                    background: booking.status === 'confirmed' 
                      ? '#28a745' 
                      : booking.status === 'cancelled' 
                      ? '#ff4d4f' 
                      : '#ffc107',
                    color: 'white'
                  }}>
                    {booking.status === 'confirmed' && '✅ ยืนยันแล้ว'}
                    {booking.status === 'cancelled' && '❌ ยกเลิกแล้ว'}
                    {booking.status === 'pending' && '⏳ รอดำเนินการ'}
                  </div>

                  {/* Flight Info */}
                  <div style={{ marginBottom: '15px', paddingRight: '120px' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: '#D4AF37',
                      fontFamily: 'Chonburi',
                      marginBottom: '8px'
                    }}>
                      {booking.flight?.flight_code || 'N/A'}
                    </div>
                    
                    <div style={{ 
                      fontSize: '1.1rem', 
                      color: '#333',
                      fontFamily: 'Prompt',
                      marginBottom: '8px'
                    }}>
                      🛫 {booking.flight?.origin || 'N/A'} 
                      <span style={{ margin: '0 10px', color: '#999' }}>→</span>
                      🛬 {booking.flight?.destination || 'N/A'}
                    </div>

                    <div style={{ 
                      fontSize: '0.95rem', 
                      color: '#666',
                      fontFamily: 'Prompt'
                    }}>
                      📅 {booking.flight?.travel_date 
                        ? new Date(booking.flight.travel_date).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    padding: '15px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '10px',
                    fontFamily: 'Prompt',
                    fontSize: '0.95rem'
                  }}>
                    <div>
                      <div style={{ color: '#888', marginBottom: '5px' }}>Booking ID</div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        #{booking.booking_id}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888', marginBottom: '5px' }}>จำนวนที่นั่ง</div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {booking.seat_count} ที่นั่ง
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888', marginBottom: '5px' }}>ราคารวม</div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: '#28a745',
                        fontSize: '1.1rem'
                      }}>
                        {new Intl.NumberFormat('th-TH', {
                          style: 'currency',
                          currency: 'THB'
                        }).format(booking.total_price)}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888', marginBottom: '5px' }}>วันที่จอง</div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {new Date(booking.booking_time).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {/* 🔥 [EDIT] แก้ไขให้เรียก handleRequestCancel แทนตัวเดิม */}
                  {booking.status === 'confirmed' && (
                    <div style={{ marginTop: '15px' }}>
                      <button
                        onClick={() => handleRequestCancel(booking.booking_id)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '50px',
                          border: '2px solid #ff4d4f',
                          background: 'white',
                          color: '#ff4d4f',
                          fontFamily: 'Prompt',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#ff4d4f';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#ff4d4f';
                        }}
                      >
                        ❌ ยกเลิกการจอง
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '2px solid #f0f0f0',
          textAlign: 'center',
          fontFamily: 'Prompt',
          color: '#888',
          fontSize: '0.9rem'
        }}>
          {!loading && bookings.length > 0 && (
            <div>
              แสดงทั้งหมด <strong style={{ color: '#D4AF37' }}>{bookings.length}</strong> รายการ
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔥 PREMIUM CANCELLATION MODAL (เพิ่มใหม่ต่อท้ายสุด) 🔥 */}
      {/* ========================================================================= */}
      {showCancelModal && (
        <div
            style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', // ดำโปร่งแสงเข้มๆ เน้นความสำคัญ
            backdropFilter: 'blur(8px)', // เบลอฉากหลังเพื่อให้ Modal เด่น
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => setShowCancelModal(false)} // คลิกพื้นหลังเพื่อปิด
        >
            <div
            style={{
                background: 'linear-gradient(145deg, #2b0808, #3b1010)', // พื้นหลังแดงเลือดหมูมืดหรู ดูแพงและซีเรียส
                borderRadius: '24px',
                padding: '40px',
                maxWidth: '450px', width: '90%',
                border: '1px solid rgba(255, 99, 71, 0.4)', // ขอบแดงจางๆ ให้ดูมีมิติ
                boxShadow: '0 25px 60px rgba(0,0,0,0.9)', // เงาลึกๆ
                textAlign: 'center',
                position: 'relative',
                animation: 'bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
            {/* Icon ตกใจ */}
            <div style={{ 
                fontSize: '4rem', marginBottom: '20px', 
                filter: 'drop-shadow(0 0 15px rgba(255, 69, 0, 0.6))',
                animation: 'shake 0.5s ease-in-out'
            }}>
                ⚠️
            </div>

            <h2 style={{ 
                fontFamily: 'Chonburi', color: '#ffcccb', margin: '0 0 15px', fontSize: '2rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
                ยืนยันการยกเลิก?
            </h2>
            
            <p style={{ fontFamily: 'Prompt', color: '#e0e0e0', marginBottom: '35px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                คุณต้องการยกเลิก Booking รหัส <br/>
                <strong style={{ color: '#D4AF37', fontSize: '1.4rem', fontFamily: 'monospace' }}>#{bookingIdToCancel}</strong> <br/>
                <span style={{ fontSize: '0.9rem', color: '#ff6b6b' }}>(การกระทำนี้ไม่สามารถเรียกคืนได้)</span>
            </p>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                {/* ปุ่มเปลี่ยนใจ */}
                <button
                onClick={() => setShowCancelModal(false)}
                style={{
                    padding: '14px 28px', borderRadius: '50px', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)', 
                    color: '#fff', fontFamily: 'Prompt', cursor: 'pointer',
                    fontSize: '1rem', transition: '0.2s', fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                เก็บไว้ก่อน
                </button>

                {/* ปุ่มลบจริง */}
                <button
                onClick={handleConfirmCancel}
                style={{
                    padding: '14px 35px', borderRadius: '50px', border: 'none',
                    // Gradient แดง-ส้ม ให้ความรู้สึกว่าเป็นปุ่มอันตรายแต่พรีเมี่ยม
                    background: 'linear-gradient(90deg, #d32f2f, #ff5722)', 
                    color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold', cursor: 'pointer',
                    fontSize: '1.1rem', transition: '0.3s', 
                    boxShadow: '0 5px 20px rgba(211, 47, 47, 0.4)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(211, 47, 47, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(211, 47, 47, 0.4)';
                }}
                >
                ใช่, ยกเลิกเลย
                </button>
            </div>

            {/* Style Animation เฉพาะกิจสำหรับ Modal นี้ */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes bounceIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                @keyframes shake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-10deg); } 75% { transform: rotate(10deg); } }
            `}</style>
            </div>
        </div>
      )}
    </>
  )
}