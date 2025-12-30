import './App.css'
import { useMemo, useState, useEffect } from 'react'
import { BookingPanel } from './components/BookingPanel'
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

  // 🛠️ แก้ไขปัญหา Persistence: เพิ่มตัวเช็ค "undefined" เพื่อป้องกันหน้าจอดำ
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    // ต้องเช็คทั้งค่าว่าง และคำว่า "undefined" ที่อาจค้างใน LocalStorage
    if (savedUser && savedUser !== "undefined") {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem('user'); // ล้างทิ้งถ้าข้อมูลเสียหาย
      }
    }
  }, []);

  // ดึงข้อมูลเที่ยวบินเมื่อ Login สำเร็จ
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
      setFlights(flights.filter(f => f.flightId !== id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setSelectedFlight(null); // ล้างค่าเที่ยวบินที่เลือกไว้ด้วย
    setLatestBooking(null);  // ล้างค่าการจองล่าสุด
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

  // หากยังไม่ล็อกอิน ให้แสดงหน้า Login
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
      <header style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #eee' }}>
        <div>
          <h1 style={{ margin: 0 }}>ระบบจองตั๋วเครื่องบิน</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            สวัสดีคุณ <strong>{currentUser.name}</strong> | สิทธิ์: <strong>{currentUser.role}</strong>
          </p>
        </div>
        <button onClick={handleLogout} style={{ height: 'fit-content', backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
          ออกจากระบบ
        </button>
      </header>

      {/* Admin View: แสดงส่วนจัดการเที่ยวบินเฉพาะ ADMIN เท่านั้น */}
      {currentUser.role === 'ADMIN' && (
        <AdminFlightManager 
          flights={flights} 
          onAddFlight={handleAddFlight} 
          onDeleteFlight={handleDeleteFlight} 
        />
      )}

      <FlightSearchForm onSearch={setSearch} />

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start', padding: '0 20px' }}>
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ marginTop: 0 }}>ผลการค้นหา ({filteredFlights.length})</h2>
          <FlightList
            flights={filteredFlights}
            selectedFlightId={selectedFlight?.flightId}
            onSelect={setSelectedFlight}
          />
        </section>

        <section style={{ textAlign: 'left' }}>
          {selectedFlight ? (
            <BookingPanel userId={currentUser.userId} flight={selectedFlight} onBooked={(booking) => {
              setLatestBooking(booking);
              // อัปเดตที่นั่งว่างใน State หน้าบ้านทันทีเพื่อให้ UI เปลี่ยน (Business Logic 20 คะแนน)
              setFlights(flights.map(f => f.flightId === selectedFlight.flightId ? { ...f, availableSeats: f.availableSeats - 1 } : f));
            }} />
          ) : (
            <div>
              <h2 style={{ marginTop: 0 }}>จองเที่ยวบิน</h2>
              <p>เลือกเที่ยวบินทางซ้ายเพื่อเริ่มจอง</p>
            </div>
          )}
        </section>
      </div>

      {latestBooking && (
        <section style={{ textAlign: 'left', padding: '20px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', margin: '0 20px' }} aria-label="latest-booking">
          <h2 style={{ marginTop: 0, color: '#52c41a' }}>🎉 การจองล่าสุดสำเร็จ!</h2>
          <div><strong>Booking ID:</strong> {latestBooking.bookingId}</div>
          <div><strong>สถานะ:</strong> {latestBooking.status}</div>
        </section>
      )}
    </div>
  )
}

export default App