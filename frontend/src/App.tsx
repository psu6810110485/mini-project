import './App.css'
<<<<<<< Updated upstream

import { useMemo, useState } from 'react'
import { BookingPanel } from './components/BookingPanel'
=======
import { useState, useEffect, useCallback } from 'react'
import BookingPanel from './components/BookingPanel' 
>>>>>>> Stashed changes
import { FlightList } from './components/FlightList'
import { FlightSearchForm } from './components/FlightSearchForm'
import type { Booking, Flight, FlightSearchParams, ID } from './types'

const CURRENT_USER_ID: ID = 1

const MOCK_FLIGHTS: Flight[] = [
  {
    flightId: 101,
    flightCode: 'TG101',
    origin: 'BKK',
    destination: 'CNX',
    travelDate: '2026-01-05T09:30:00.000Z',
    price: 1890,
    availableSeats: 8,
  },
  {
    flightId: 102,
    flightCode: 'FD202',
    origin: 'BKK',
    destination: 'HKT',
    travelDate: '2026-01-06T03:15:00.000Z',
    price: 1290,
    availableSeats: 0,
  },
  {
    flightId: 103,
    flightCode: 'PG303',
    origin: 'CNX',
    destination: 'BKK',
    travelDate: '2026-01-07T12:00:00.000Z',
    price: 1690,
    availableSeats: 12,
  },
]

function App() {
<<<<<<< Updated upstream
  const [search, setSearch] = useState<FlightSearchParams>({
    origin: '',
    destination: '',
    travelDate: '',
  })
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null)

  const filteredFlights = useMemo(() => {
    const origin = search.origin.trim().toLowerCase()
    const destination = search.destination.trim().toLowerCase()
    const travelDate = search.travelDate

    return MOCK_FLIGHTS.filter((f) => {
      const originOk = origin.length === 0 || f.origin.toLowerCase().includes(origin)
      const destOk = destination.length === 0 || f.destination.toLowerCase().includes(destination)
      const dateOk =
        travelDate.length === 0 ||
        new Date(f.travelDate).toISOString().slice(0, 10) === travelDate
      return originOk && destOk && dateOk
    })
  }, [search.destination, search.origin, search.travelDate])

  function handleSearch(params: FlightSearchParams) {
    setSearch(params)
    setSelectedFlight(null)
    setLatestBooking(null)
  }

  function handleSelectFlight(flight: Flight) {
    setSelectedFlight(flight)
    setLatestBooking(null)
  }

  function handleBooked(booking: Booking) {
    setLatestBooking(booking)
=======
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser || savedUser === 'undefined') return null
    try {
      const raw = JSON.parse(savedUser) as any
      const normalized: User = {
        user_id: raw.user_id ?? raw.userId,
        name: raw.name,
        email: raw.email,
        role: raw.role,
      }
      return normalized.user_id ? normalized : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  });
  const [flights, setFlights] = useState<Flight[]>([]); 
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null)

  // 2. ฟังก์ชันดึงข้อมูล (ใช้ useCallback เพื่อไม่ให้สร้างฟังก์ชันใหม่ซ้ำๆ)
  const fetchFlights = useCallback(async (params?: FlightSearchParams) => {
    try {
      // แปลง params ให้เป็น Query String (ส่ง undefined ถ้าไม่มีค่า เพื่อให้ Backend รู้ว่าไม่ใช่การ Search)
      const query = {
        origin: params?.origin || undefined,
        destination: params?.destination || undefined,
        date: params?.travelDate || undefined 
      };

      // ยิง API ไปที่ Backend
      const response = await api.get<any[]>('/flights', { params: query });
      
      // แปลงข้อมูลให้เป็น Format ที่ถูกต้อง
      const mappedFlights: Flight[] = response.data.map((f) => ({
        flight_id: f.flight_id || f.flightId,
        flight_code: f.flight_code || f.flightCode,
        origin: f.origin,
        destination: f.destination,
        travel_date: f.travel_date || f.travelDate,
        price: f.price,
        available_seats: f.available_seats || f.availableSeats,
        status: f.status || 'Active'
      }));

      setFlights(mappedFlights);
      
    } catch (error) {
      console.error("Failed to fetch flights", error);
    }
  }, []);

  // ✅ 3. หัวใจสำคัญ: สั่งให้โหลดข้อมูลทันทีที่ Login สำเร็จ หรือกด Refresh
  useEffect(() => {
    if (currentUser) {
      fetchFlights(); // เรียกแบบไม่มี params = "โหลดข้อมูลทั้งหมด"
    }
  }, [currentUser, fetchFlights]);

  const handleSearch = (params: FlightSearchParams) => {
    fetchFlights(params); // โหลดแบบมีเงื่อนไข
    setSelectedFlight(null);
  };

  const handleAddFlight = (newFlight: Flight) => {
    // Optimistic Update: เพิ่มลงในหน้าจอก่อนเพื่อให้ User รู้สึกว่าเร็ว
    // (แปลง Key ให้ชัวร์ก่อนนำไปแสดงผล)
    const mappedNewFlight: Flight = {
        flight_id: newFlight.flight_id || (newFlight as any).flightId,
        flight_code: newFlight.flight_code || (newFlight as any).flightCode,
        origin: newFlight.origin,
        destination: newFlight.destination,
        travel_date: newFlight.travel_date || (newFlight as any).travelDate,
        price: newFlight.price,
        available_seats: newFlight.available_seats || (newFlight as any).availableSeats,
        status: newFlight.status || 'Active'
    };

    // เอาตัวใหม่ไปแปะไว้ "บนสุด" ของรายการ
    setFlights((prevFlights) => [mappedNewFlight, ...prevFlights]);
    
    // ไม่ต้องเรียก fetchFlights() ซ้ำ เพื่อป้องกันข้อมูลกระเด้งหายไปอยู่ท้ายตาราง
  };

  const handleDeleteFlight = async (id: ID) => {
    if (window.confirm('คุณต้องการลบเที่ยวบินนี้ใช่หรือไม่?')) {
        // ลบออกจากหน้าจอ
        setFlights(flights.filter(f => f.flight_id !== id));
        // (ในอนาคต: อย่าลืม uncomment บรรทัดนี้เพื่อลบใน DB จริง)
        // await api.delete(`/flights/${id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return (
      <div className="App">
        <header style={{ padding: '20px' }}>
          <h1 className="system-title">ระบบจองตั๋วเครื่องบิน</h1>
        </header>
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
>>>>>>> Stashed changes
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0 }}>ระบบจองตั๋วเครื่องบิน</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Frontend (Strict Typing) — ตัวอย่างการผูก type กับข้อมูลจาก API</p>
      </header>

<<<<<<< Updated upstream
      <FlightSearchForm onSearch={handleSearch} />

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start' }}>
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ marginTop: 0 }}>ผลการค้นหา</h2>
          <FlightList
            flights={filteredFlights}
            selectedFlightId={selectedFlight?.flightId}
            onSelect={handleSelectFlight}
          />
        </section>

        {selectedFlight ? (
          <BookingPanel userId={CURRENT_USER_ID} flight={selectedFlight} onBooked={handleBooked} />
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
          <div>Flight ID: {latestBooking.flightId}</div>
          <div>Seats: {latestBooking.seatCount}</div>
          <div>Status: {latestBooking.status}</div>
=======
      {currentUser.role === 'ADMIN' && (
        <AdminFlightManager 
          flights={flights} 
          onAddFlight={handleAddFlight} 
          onDeleteFlight={handleDeleteFlight} 
        />
      )}

      <FlightSearchForm onSearch={handleSearch} />

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'start', padding: '0 10px' }}>
        <section style={{ textAlign: 'left' }}>
          <h2 style={{ marginTop: 0, color: 'var(--rich-gold)', fontFamily: 'Chonburi' }}>
            ผลการค้นหา ({flights.length})
          </h2>
          
          <FlightList
            flights={flights}
            selectedFlightId={selectedFlight?.flight_id}
            onSelect={setSelectedFlight}
          />
        </section>

        <section style={{ textAlign: 'left' }}>
          {selectedFlight ? (
            <BookingPanel 
                userId={currentUser.user_id}   
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
>>>>>>> Stashed changes
        </section>
      ) : null}
    </div>
  )
}

export default App
