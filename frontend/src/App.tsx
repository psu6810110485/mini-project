import './App.css'
import { useMemo, useState, useEffect } from 'react'
import { BookingPanel } from './components/BookingPanel'
import { FlightList } from './components/FlightList'
import { FlightSearchForm } from './components/FlightSearchForm'
import { Login } from './components/Login' 
import { AdminFlightManager } from './components/AdminFlightManager' // 1. Import เพิ่ม
import api from './api/axios' 
import type { Booking, Flight, FlightSearchParams, User, ID } from './types' // 2. เพิ่ม ID type

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

  // ตรวจสอบสถานะ Login เมื่อเปิดเว็บครั้งแรก (Persistence) [cite: 34]
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // ดึงข้อมูลเที่ยวบินจริงเมื่อ Login สำเร็จ (Integration) [cite: 6, 37]
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

  // 3. เพิ่มฟังก์ชันจัดการข้อมูลสำหรับ Admin (CRUD Logic) 
  const handleAddFlight = (newFlight: Flight) => {
    setFlights([newFlight, ...flights]); // อัปเดต State หน้าบ้านทันที
  };

  const handleDeleteFlight = (id: ID) => {
    if (window.confirm('คุณต้องการลบเที่ยวบินนี้ใช่หรือไม่?')) {
      setFlights(flights.filter(f => f.flightId !== id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
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
        new Date(f.travelDate).toISOString().slice(0, 10) === travelDate
      return originOk && destOk && dateOk
    })
  }, [search.destination, search.origin, search.travelDate, flights])

  if (!currentUser) {
    return (
      <div className="App">
        <header style={{ padding: '20px' }}>
          <h1>ระบบจองตั๋วเครื่องบิน</h1>
        </header>
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>ระบบจองตั๋วเครื่องบิน</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            สวัสดีคุณ <strong>{currentUser.name}</strong> | สิทธิ์: <strong>{currentUser.role}</strong>
          </p>
        </div>
        <button onClick={handleLogout} style={{ height: 'fit-content' }}>ออกจากระบบ</button>
      </header>

      {/* 4. อัปเดตส่วน Admin View: เรียกใช้ AdminFlightManager เมื่อสิทธิ์เป็น ADMIN  */}
      {currentUser.role === 'ADMIN' && (
        <AdminFlightManager 
          flights={flights} 
          onAddFlight={handleAddFlight} 
          onDeleteFlight={handleDeleteFlight} 
        />
      )}

      <FlightSearchForm onSearch={setSearch} />

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start' }}>
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ marginTop: 0 }}>ผลการค้นหา</h2>
          <FlightList
            flights={filteredFlights}
            selectedFlightId={selectedFlight?.flightId}
            onSelect={setSelectedFlight}
          />
        </section>

        {selectedFlight ? (
          <BookingPanel userId={currentUser.userId} flight={selectedFlight} onBooked={setLatestBooking} />
        ) : (
          <section style={{ textAlign: 'left' }}>
            <h2 style={{ marginTop: 0 }}>จองเที่ยวบิน</h2>
            <p>เลือกเที่ยวบินทางซ้ายเพื่อเริ่มจอง</p>
          </section>
        )}
      </div>

      {latestBooking ? (
        <section style={{ textAlign: 'left' }} aria-label="latest-booking">
          <h2 style={{ marginTop: 0 }}>การจองล่าสุด</h2>
          <div>Booking ID: {latestBooking.bookingId}</div>
          <div>Status: {latestBooking.status}</div>
        </section>
      ) : null}
    </div>
  )
}

export default App