import './App.css'
import { useMemo, useState, useEffect } from 'react'
import BookingPanel from './components/BookingPanel' // ✅ ตรวจสอบว่า BookingPanel มี export default
import { FlightList } from './components/FlightList'
import { FlightSearchForm } from './components/FlightSearchForm'
import { Login } from './components/Login' 
import { AdminFlightManager } from './components/AdminFlightManager'
import api from './api/axios' 
import type { Booking, Flight, FlightSearchParams, User, ID } from './types'

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

  // 🛠️ ตรวจสอบ User จาก LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== "undefined") {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 🛠️ ดึงข้อมูลเที่ยวบิน
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await api.get<Flight[]>('/flights');
        setFlights(response.data);
      } catch (error) {
        console.error("Failed to fetch flights", error);
      }
    };

    if (currentUser) {
      fetchFlights();
    }
  }, [currentUser]);

  const handleAddFlight = (newFlight: Flight) => {
    setFlights([newFlight, ...flights]);
  };

  const handleDeleteFlight = (id: ID) => {
    if (window.confirm('คุณต้องการลบเที่ยวบินนี้ใช่หรือไม่?')) {
      setFlights(flights.filter(f => f.flight_id !== id));
    }
  };

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
      
      const dateOk =
        travelDate.length === 0 ||
        new Date(f.travel_date).toISOString().slice(0, 10) === travelDate
      return originOk && destOk && dateOk
    })
  }, [search.destination, search.origin, search.travelDate, flights])

  // หากยังไม่ล็อกอิน ให้แสดงหน้า Login
  if (!currentUser) {
    return (
      <div className="App">
        <header style={{ padding: '20px' }}>
          <h1 className="system-title">ระบบจองตั๋วเครื่องบิน</h1>
        </header>
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header className="glass-panel" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', marginBottom: '10px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: 'Chonburi' }}>ระบบจองตั๋วเครื่องบิน</h1>
          <p style={{ margin: 0, opacity: 0.9, fontFamily: 'Prompt' }}>
            สวัสดีคุณ <strong>{currentUser.name}</strong> | สิทธิ์: <strong>{currentUser.role}</strong>
          </p>
        </div>
        <button onClick={handleLogout} style={{ height: 'fit-content', backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'Prompt', fontWeight: 'bold' }}>
          ออกจากระบบ
        </button>
      </header>

      {/* Admin View */}
      {currentUser.role === 'ADMIN' && (
        <AdminFlightManager 
          flights={flights} 
          onAddFlight={handleAddFlight} 
          onDeleteFlight={handleDeleteFlight} 
        />
      )}

      <FlightSearchForm onSearch={setSearch} />

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start', padding: '0 10px' }}>
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ marginTop: 0, color: 'var(--rich-gold)', fontFamily: 'Chonburi' }}>ผลการค้นหา ({filteredFlights.length})</h2>
          
          <FlightList
            flights={filteredFlights}
            selectedFlightId={selectedFlight?.flight_id}
            onSelect={setSelectedFlight}
          />
        </section>

        <section style={{ textAlign: 'left' }}>
          {selectedFlight ? (
            /* ✅ แก้ไขจุดที่แดง: ส่ง Props ให้ครบ (userId, flight, onBooked) */
            <BookingPanel 
                userId={currentUser.user_id}   // ส่ง userId ของ user ปัจจุบัน
                flight={selectedFlight}        // ส่ง flight ที่เลือก
                onBooked={(booking) => {       // ใช้ onBooked แทน onConfirm
                   // รับ Object booking ที่สร้างสำเร็จมาจาก BookingPanel
                   setLatestBooking(booking);
                   
                   // อัปเดตจำนวนที่นั่งว่างในรายการเที่ยวบินทันที (Client-side update)
                   setFlights(flights.map(f => 
                       f.flight_id === booking.flight_id 
                       ? { ...f, available_seats: f.available_seats - booking.seat_count } 
                       : f
                   ));
                }} 
            />
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
              <h2 style={{ marginTop: 0, fontFamily: 'Chonburi', color: '#ccc' }}>จองเที่ยวบิน</h2>
              <p style={{ fontFamily: 'Prompt' }}>👈 กรุณาเลือกเที่ยวบินทางซ้ายเพื่อเริ่มจอง</p>
            </div>
          )}
        </section>
      </div>

      {latestBooking && (
        <section style={{ textAlign: 'left', padding: '20px', backgroundColor: 'rgba(40, 167, 69, 0.2)', border: '1px solid #28a745', borderRadius: '15px', margin: '20px' }} aria-label="latest-booking">
          <h2 style={{ marginTop: 0, color: '#28a745', fontFamily: 'Chonburi' }}>🎉 การจองล่าสุดสำเร็จ!</h2>
          <div style={{ fontFamily: 'Prompt' }}><strong>Booking ID:</strong> {latestBooking.booking_id}</div>
          <div style={{ fontFamily: 'Prompt' }}><strong>สถานะ:</strong> {latestBooking.status}</div>
        </section>
      )}
    </div>
  )
}

export default App