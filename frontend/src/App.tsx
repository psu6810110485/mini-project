import './App.css'
import { useMemo, useState, useEffect } from 'react'
import { BookingPanel } from './components/BookingPanel'
import { FlightList } from './components/FlightList'
import { FlightSearchForm } from './components/FlightSearchForm'
import { Login } from './components/Login' // เพิ่มหน้า Login เข้ามา
import api from './api/axios' // นำ axios instance มาใช้สำหรับ Integration 
import type { Booking, Flight, FlightSearchParams, User } from './types'

function App() {
  // 1. จัดการสถานะผู้ใช้ (Authentication State) 
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]); // สำหรับเก็บข้อมูลที่จะ Fetch จาก API [cite: 37]
  const [search, setSearch] = useState<FlightSearchParams>({
    origin: '',
    destination: '',
    travelDate: '',
  })
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null)

  // 2. ตรวจสอบสถานะ Login เมื่อเปิดเว็บครั้งแรก (Persistence) 
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // 3. ดึงข้อมูลเที่ยวบินจริงเมื่อ Login สำเร็จ (Integration) [cite: 6, 37]
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        // หากต้องการใช้ Mock ไปก่อนให้คอมเมนต์บรรทัดนี้ไว้ แต่ถ้าต่อหลังบ้านแล้วให้เปิดใช้ครับ
        const response = await api.get<Flight[]>('/flights');
        setFlights(response.data);
      } catch (error) {
        console.error("Failed to fetch flights", error);
        // หาก API หลังบ้านยังไม่พร้อม ให้ใช้ Mock Data ที่คุณเตรียมไว้แทนชั่วคราว
        // setFlights(MOCK_FLIGHTS); 
      }
    };

    if (currentUser) {
      fetchFlights();
    }
  }, [currentUser]);

  // ฟังก์ชันสำหรับออกจากระบบ 
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Logic การค้นหาเดิมของคุณ (เปลี่ยนจาก MOCK_FLIGHTS เป็น flights จาก API)
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

  // --- เงื่อนไขแสดงหน้า Public View (Login)  ---
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

  // --- หน้าจอหลักหลัง Login (User/Admin View) [cite: 37, 38] ---
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

      {/* ตัวอย่าง Admin View: ปุ่มที่ User ธรรมดาจะไม่เห็น [cite: 38] */}
      {currentUser.role === 'ADMIN' && (
        <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'left' }}>
          <strong>Admin Panel:</strong> <button style={{ marginLeft: '10px' }}>เพิ่มเที่ยวบินใหม่</button>
        </div>
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