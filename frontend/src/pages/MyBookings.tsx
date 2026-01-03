import { useState, useEffect } from 'react';
import api from '../api/axios';

interface BookingItem {
  booking_id: number;
  status: string;
  seat_count: number;
  total_price: number;
  booking_time: string;
  flight?: {
    flight_code: string;
    origin: string;
    destination: string;
    travel_date: string;
  };
}

interface MyBookingsProps {
  userId: number;
  onClose: () => void;
}

const MyBookings = ({ userId, onClose }: MyBookingsProps) => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get(`/bookings/my-bookings/${userId}`);
        setBookings(response.data);
      } catch (error) {
        console.error('โหลดข้อมูลประวัติการจองไม่สำเร็จ', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // ปรับให้เข้มขึ้นเล็กน้อย
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(3px)' // เพิ่ม Effect เบลอฉากหลัง
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          backgroundColor: '#fff',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontFamily: 'Chonburi', color: '#333' }}>
            ✈️ ประวัติการจองของฉัน
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Prompt',
              fontWeight: 'bold',
            }}
          >
            ปิด
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Prompt' }}>
            <p>⏳ กำลังโหลดข้อมูล...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Prompt', color: '#666' }}>
            <p>🚫 คุณยังไม่มีรายการจองในขณะนี้</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {bookings.map((item) => (
              <div
                key={item.booking_id}
                style={{
                  border: '1px solid #eee',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: '#f9f9f9', // ปรับพื้นหลังการ์ดให้สว่างขึ้น
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      color: '#1a73e8',
                      marginBottom: '8px',
                      fontFamily: 'Chonburi',
                    }}
                  >
                    {item.flight?.flight_code || 'ไม่ระบุรหัส'}
                  </div>
                  <div style={{ fontSize: '16px', marginBottom: '5px', fontFamily: 'Prompt' }}>
                    📍 {item.flight?.origin} ➔ {item.flight?.destination}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px', fontFamily: 'Prompt' }}>
                    📅 วันเดินทาง: {item.flight?.travel_date ? formatDate(item.flight.travel_date) : '-'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#999', fontFamily: 'Prompt' }}>
                    ⏰ จองเมื่อ: {formatDate(item.booking_time)} เวลา {formatTime(item.booking_time)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '22px',
                      color: '#333',
                      marginBottom: '8px',
                      fontFamily: 'Chonburi',
                    }}
                  >
                    ฿{Number(item.total_price).toLocaleString()}
                  </div>
                  <div
                    style={{
                      color: item.status === 'Confirmed' ? '#52c41a' : '#faad14',
                      fontSize: '12px',
                      backgroundColor: item.status === 'Confirmed' ? '#f6ffed' : '#fffbe6',
                      border: `1px solid ${item.status === 'Confirmed' ? '#b7eb8f' : '#ffe58f'}`,
                      padding: '4px 12px',
                      borderRadius: '10px',
                      display: 'inline-block',
                      fontFamily: 'Prompt',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.status === 'Confirmed' ? '✅ ยืนยันแล้ว' : item.status}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#ccc',
                      marginTop: '5px',
                      fontFamily: 'Prompt',
                    }}
                  >
                    ID: {item.booking_id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Export Default เพื่อให้ App.tsx เรียกใช้ได้ถูกต้อง
export default MyBookings;