// frontend/src/pages/MyBookings.tsx

import { useState, useEffect } from 'react'
import api from '../api/axios'
import type { Booking, ID } from '../types'

interface MyBookingsProps {
  userId: ID
  onClose: () => void
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
  const [bookings, setBookings] = useState<BookingWithFlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [userId])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // ✅ เรียก API ดึงประวัติการจอง
      const response = await api.get<BookingWithFlight[]>(`/bookings/user/${userId}`)
      
      console.log('📦 Bookings Data:', response.data)
      setBookings(response.data)
    } catch (err: any) {
      console.error('❌ Failed to fetch bookings:', err)
      setError(err.response?.data?.message || 'ไม่สามารถโหลดประวัติการจองได้')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: ID) => {
    if (!window.confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) return

    try {
      await api.patch(`/bookings/${bookingId}`, { status: 'cancelled' })
      
      // ✅ อัปเดต State
      setBookings(prev => 
        prev.map(b => 
          b.booking_id === bookingId 
            ? { ...b, status: 'cancelled' } 
            : b
        )
      )
      
      alert('✅ ยกเลิกการจองสำเร็จ')
    } catch (err: any) {
      console.error('❌ Failed to cancel booking:', err)
      alert('ยกเลิกการจองไม่สำเร็จ: ' + (err.response?.data?.message || 'เกิดข้อผิดพลาด'))
    }
  }

  return (
    <>
      {/* Overlay */}
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

      {/* Modal */}
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
                  {booking.status === 'confirmed' && (
                    <div style={{ marginTop: '15px' }}>
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id)}
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
    </>
  )
}