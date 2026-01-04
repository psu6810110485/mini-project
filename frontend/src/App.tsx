import './App.css'
import { useMemo, useState, useEffect, useCallback } from 'react'
import BookingPanel from './components/BookingPanel' 
import { FlightList } from './components/FlightList'
import { FlightSearchForm } from './components/FlightSearchForm'
import { Login } from './components/Login' 
import { AdminFlightManager } from './components/AdminFlightManager'

// ✅ Import หน้าประวัติการจอง
import MyBookings from './pages/MyBookings' 

import api from './api/axios' 
import type { Booking, Flight, FlightSearchParams, User, ID } from './types'

// --- Helper Functions ---

function mapFlightFromApi(raw: any): Flight {
  return {
    flight_id: raw.flight_id ?? raw.flightId,
    flight_code: raw.flight_code ?? raw.flightCode,
    origin: raw.origin,
    destination: raw.destination,
    travel_date: raw.travel_date ?? raw.travelDate,
    price: raw.price,
    available_seats: raw.available_seats ?? raw.availableSeats,
    status: raw.status ?? 'Active',
  }
}

function toLocalYyyyMmDd(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]); 
  const [search, setSearch] = useState<FlightSearchParams>({
    origin: '',
    destination: '',
    travelDate: '',
  })
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null)
  
  // ✅ State สำหรับเปิด/ปิด Modal ประวัติการจอง
  const [showMyBookings, setShowMyBookings] = useState(false) 

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser);
        // ✅ Debug: แสดงข้อมูล user ที่โหลดจาก localStorage
        console.log('📦 Loaded user from localStorage:', parsedUser);
        console.log('🔑 userId:', parsedUser.userId);
        console.log('🔑 user_id:', parsedUser.user_id);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const fetchFlights = useCallback(async () => {
    try {
      const response = await api.get<any[]>('/flights')
      const mappedFlights: Flight[] = response.data.map(mapFlightFromApi)
      setFlights(mappedFlights)
      setSearch({ origin: '', destination: '', travelDate: '' })
    } catch (error) {
      console.error('Failed to fetch flights', error)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchFlights()
    }
  }, [currentUser, fetchFlights])

  const handleAddFlight = async (newFlight: any) => { 
    try {
      console.log("🛠️ รับค่าจากฟอร์ม:", newFlight);

      const payload = {
        flightCode: newFlight.flightCode ?? newFlight.flight_code, 
        origin: newFlight.origin,
        destination: newFlight.destination,
        travelDate: newFlight.travelDate ?? newFlight.travel_date, 
        price: Number(newFlight.price),
        availableSeats: Number(newFlight.availableSeats ?? newFlight.available_seats), 
      }

      console.log("📦 กำลังส่งไป Backend:", payload);

      const response = await api.post<any>('/flights', payload)
      
      const created = mapFlightFromApi(response.data)
      setFlights((prev) => [created, ...prev.filter((f) => f.flight_id !== created.flight_id)])
      
      alert("✅ เพิ่มเที่ยวบินสำเร็จเรียบร้อย!");
    } catch (error: any) {
      console.error('❌ Failed to create flight:', error);
      const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      alert(`เพิ่มเที่ยวบินไม่สำเร็จ: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
      throw error;
    }
  }

  const handleDeleteFlight = async (id: ID) => {
    if (!window.confirm('คุณต้องการลบเที่ยวบินนี้ใช่หรือไม่?')) return

    try {
      await api.delete(`/flights/${id}`)
      setFlights((prev) => prev.filter((f) => f.flight_id !== id))
    } catch (error) {
      console.error('Failed to delete flight', error)
      alert('ลบเที่ยวบินไม่สำเร็จ (ตรวจสอบสิทธิ์/การเชื่อมต่อ Backend)')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setSelectedFlight(null);
    setLatestBooking(null);
  };

  const filteredFlights = useMemo(() => {
    const origin = (search.origin ?? '').trim().toLowerCase()
    const destination = (search.destination ?? '').trim().toLowerCase()
    const travelDate = search.travelDate ?? ''

    return flights.filter((f) => {
      const originOk = origin.length === 0 || f.origin.toLowerCase().includes(origin)
      const destOk = destination.length === 0 || f.destination.toLowerCase().includes(destination)
      const flightDate = toLocalYyyyMmDd(f.travel_date)
      const dateOk = travelDate.length === 0 || flightDate === travelDate;
      return originOk && destOk && dateOk
    })
  }, [search.destination, search.origin, search.travelDate, flights])

  // ✅ Helper function: ดึง userId ที่ถูกต้อง
  const getUserId = (user: User | null): ID => {
    if (!user) return 0;
    // ลองดึง userId (camelCase จาก Backend) ก่อน, ถ้าไม่มีใช้ user_id (snake_case)
    const id = user.userId ?? user.user_id ?? 0;
    console.log('🆔 Getting userId:', { userId: user.userId, user_id: user.user_id, result: id });
    return id;
  };

  // =========================================================
  // 🔥 ส่วน UI: แยกการแสดงผลตามสถานะ Login
  // =========================================================

  // 1️⃣ กรณี "ยังไม่ Login": ใช้ Layout แบบ Full Screen + รูปพื้นหลัง (Classic Luxury Theme)
  if (!currentUser) {
    return (
      <div style={{ 
        position: 'fixed', // บังคับเต็มจอ ทับทุกอย่าง
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        // ✅ รูปพื้นหลังเครื่องบินที่คุณต้องการ
        background: `linear-gradient(rgba(0, 20, 40, 0.4), rgba(0, 20, 40, 0.6)), url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* หัวข้อสีทอง */}
        <h1 className="system-title" style={{ 
          fontFamily: 'Chonburi', 
          fontSize: '4rem', 
          marginBottom: '30px',
          marginTop: '0',
          background: 'linear-gradient(135deg, #c5a059 0%, #fbd287 50%, #c5a059 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))',
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          ระบบจองตั๋วเครื่องบิน
        </h1>
        
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  // 2️⃣ กรณี "Login แล้ว": ใช้ Layout แบบ Dashboard Pro (Clean & Modern Theme)
  return (
    <div>
      {/* Navbar ด้านบน */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '10px 40px', 
        background: 'rgba(255, 255, 255, 0.95)', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'sticky', top: 0, zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2rem' }}>✈️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'Chonburi', background: 'none', WebkitTextFillColor: '#002b49', color: '#002b49' }}>SKY WINGS</h1>
            <span style={{ fontSize: '0.75rem', color: '#888', fontFamily: 'Prompt', letterSpacing: '2px', textTransform: 'uppercase' }}>Premium Airlines</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right', marginRight: '10px' }}>
             <div style={{ fontWeight: 'bold', color: '#333', fontFamily: 'Prompt', fontSize: '0.9rem' }}>{currentUser.name}</div>
             <div style={{ fontSize: '0.75rem', color: 'var(--rich-gold)', fontWeight: 'bold' }}>{currentUser.role}</div>
          </div>
          
          {currentUser.role === 'USER' && (
            <button
              onClick={() => setShowMyBookings(true)}
              style={{
                backgroundColor: 'transparent',
                color: '#002b49',
                border: '2px solid #002b49',
                padding: '8px 20px',
                borderRadius: '50px',
                cursor: 'pointer',
                fontFamily: 'Prompt',
                fontWeight: 'bold',
                transition: '0.3s'
              }}
            >
              📋 ประวัติการจอง
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Prompt',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(255, 77, 79, 0.3)'
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </nav>

      {/* Hero Section (ภาพปกสวยๆ สำหรับหน้าใน - แยกจากหน้า Login) */}
      <div style={{ 
        textAlign: 'center', padding: '80px 20px 60px', 
        color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)',
        marginBottom: '-50px',
        // ใช้พื้นหลังคนละรูปกับหน้า Login เพื่อความแตกต่างและสดใหม่
        background: `linear-gradient(rgba(0, 43, 73, 0.3), rgba(0, 43, 73, 0.6)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <h1 className="system-title" style={{ fontSize: '3.5rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))', color: 'white', fontFamily: 'Chonburi' }}>ออกเดินทางสู่จุดหมายในฝัน</h1>
        <p style={{ fontSize: '1.3rem', fontFamily: 'Prompt', opacity: 0.95 }}>จองตั๋วเครื่องบินราคาพิเศษ สะดวก รวดเร็ว ปลอดภัย</p>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        
        {/* ส่วนค้นหา (Search) */}
        <div style={{ marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
           <FlightSearchForm onSearch={setSearch} />
        </div>

        {/* ส่วน Admin (ถ้ามีสิทธิ์) */}
        {currentUser.role === 'ADMIN' && (
          <div style={{ marginBottom: '30px' }}>
            <AdminFlightManager 
              flights={flights} 
              onAddFlight={handleAddFlight} 
              onDeleteFlight={handleDeleteFlight} 
            />
          </div>
        )}

        {/* Grid Layout: ซ้ายรายการเที่ยวบิน - ขวาแผงจอง */}
        <div style={{ display: 'grid', gap: 30, gridTemplateColumns: '1.8fr 1.2fr', alignItems: 'start' }}>
          
          <section style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h2 style={{ margin: 0, color: 'var(--rich-gold)', fontFamily: 'Chonburi', fontSize: '1.8rem', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                 ✈️ เที่ยวบินที่ค้นหา ({filteredFlights.length})
               </h2>
            </div>
            
            <FlightList
              flights={filteredFlights}
              selectedFlightId={selectedFlight?.flight_id}
              onSelect={setSelectedFlight}
            />
          </section>

          <section style={{ textAlign: 'left', position: 'sticky', top: '100px' }}>
            {selectedFlight ? (
              <BookingPanel 
                  userId={getUserId(currentUser)}
                  flight={selectedFlight}        
                  onBooked={(booking) => {       
                     setLatestBooking(booking);
                     setFlights(flights.map(f => 
                         f.flight_id === booking.flight_id 
                         ? { ...f, available_seats: f.available_seats - booking.seat_count } 
                         : f
                     ));
                  }} 
              />
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 30px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🎫</div>
                <h2 style={{ marginTop: 0, fontFamily: 'Chonburi', color: '#ccc' }}>รอการเลือกเที่ยวบิน</h2>
                <p style={{ fontFamily: 'Prompt', color: '#aaa' }}>
                  กรุณาเลือกเที่ยวบินจากรายการทางซ้ายมือ<br/>เพื่อดูรายละเอียดและทำการจอง
                </p>
              </div>
            )}

            {latestBooking && (
              <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'rgba(40, 167, 69, 0.1)', border: '1px solid #28a745', borderRadius: '15px', backdropFilter: 'blur(5px)' }}>
                <h3 style={{ margin: '0 0 10px', color: '#28a745', fontFamily: 'Chonburi' }}>🎉 จองสำเร็จ!</h3>
                <div style={{ fontFamily: 'Prompt', fontSize: '0.9rem', color: '#333' }}>Booking ID: <strong>{latestBooking.booking_id}</strong></div>
                <div style={{ fontFamily: 'Prompt', fontSize: '0.9rem', color: '#333' }}>สถานะ: <strong>{latestBooking.status}</strong></div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal ประวัติการจอง */}
      {showMyBookings && (
        <MyBookings 
            userId={getUserId(currentUser)}
            onClose={() => setShowMyBookings(false)} 
        />
      )}
    </div>
  )
}

export default App