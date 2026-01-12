// App.tsx

import './App.css'
import { useMemo, useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2' // ✅ Import ตัวช่วย UI สวยๆ (ต้อง npm install sweetalert2 ก่อน)
import BookingPanel from './components/BookingPanel' 
import { FlightList } from './components/FlightList'
import { FlightSearchForm } from './components/FlightSearchForm'
import { Login } from './components/Login' 
import { AdminFlightManager } from './components/AdminFlightManager'

// ✅ Import หน้าประวัติการจอง
import MyBookings from './pages/MyBookings' 

import api from './api/axios' 
import type { Booking, Flight, FlightSearchParams, User, ID } from './types'

// --- Helper Functions --- แปลงข้อมูลจาก API ให้เป็นรูปแบบที่ใช้งานในระบบ

function mapFlightFromApi(raw: any): Flight { //แปลงข้อมูลเที่ยวบินจาก API ให้เป็นรูปแบบ Flight
  return {
    flight_id: raw.flight_id ?? raw.flightId, //?? แปลว่า "ถ้าข้างหน้าไม่มี ให้เอาข้างหลัง"
    flight_code: raw.flight_code ?? raw.flightCode,
    origin: raw.origin,
    destination: raw.destination,
    travel_date: raw.travel_date ?? raw.travelDate,
    price: raw.price,
    available_seats: raw.available_seats ?? raw.availableSeats,
    status: raw.status ?? 'Active',
  }
}

//แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
function toLocalYyyyMmDd(value: string | Date | null | undefined): string { // รับค่าเป็น string หรือ Date หรือ null/undefined
  if (!value) return '' 
  const date = value instanceof Date ? value : new Date(value) //ถ้าสิ่งที่ส่งมาเป็นข้อความ (String) ให้เสกให้เป็นวัตถุวันที่ (Date Object)
  if (Number.isNaN(date.getTime())) return '' //ถ้าแปลงแล้วไม่สำเร็จ ให้คืนค่าว่าง
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') //เดือนใน JavaScript เริ่มต้นที่ 0 (มกราคม) ถึง 11 (ธันวาคม) 2,0 คือ เติม 0 ด้านหน้าให้ครบ 2 หลัก
  const day = String(date.getDate()).padStart(2, '0') //วันที่ของเดือน (1-31) เติม 0 ด้านหน้าให้ครบ 2 หลัก
  return `${year}-${month}-${day}`
}

//State (สเตท) คือสิ่งที่แอปต้อง "จำ" เอาไว้ตลอดเวลา เพราะถ้าค่าพวกนี้เปลี่ยน หน้าจอต้องเปลี่ยนตามทันทีครับ
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [flights, setFlights] = useState<Flight[]>([]); 
  const [search, setSearch] = useState<FlightSearchParams>({  //ลูกค้าพิมพ์อะไรในช่องค้นหา?" (เช่น ต้นทาง: กรุงเทพ, ปลายทาง: ภูเก็ต)
    origin: '',
    destination: '',
    travelDate: '',
  })
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null) //พอลูกค้าคลิกที่ตั๋วใบหนึ่ง ข้อมูลตั๋วนั้นจะมาอยู่ที่นี่ แล้วแผงจองด้านขวา (BookingPanel) ก็จะเด้งขึ้นมา
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null) //เก็บข้อมูลการจองล่าสุดที่ลูกค้าทำสำเร็จไว้ เพื่อแสดงข้อความยืนยันการจอง
 


  // ✅ State สำหรับเปิด/ปิด Modal ประวัติการจอง
  const [showMyBookings, setShowMyBookings] = useState(false)  //ตอนนี้กำลังเปิดหน้าต่าง 'ประวัติการจอง' อยู่หรือเปล่า?" false=ปิด, true=เปิด

  useEffect(() => {   //โหลดข้อมูลผู้ใช้ที่เก็บไว้ใน localStorage ตอนแอปเริ่มทำงาน ไม่ต้องกรอกข้อมูลใหม่ทุกครั้ง
    const savedUser = localStorage.getItem('user'); //โหลดข้อมูลผู้ใช้ที่เก็บไว้ใน localStorage
    if (savedUser && savedUser !== "undefined") {  // ถ้ามีข้อมูลผู้ใช้ และไม่ใช่ "undefined"
      try {
        const parsedUser = JSON.parse(savedUser);//แปลงข้อมูลจากข้อความ (String) เป็นวัตถุ (Object)
        // ✅ Debug: แสดงข้อมูล user ที่โหลดจาก localStorage 
        console.log('📦 Loaded user from localStorage:', parsedUser); //parsedUser คือพร้อมใช้งาน
        console.log('🔑 userId:', parsedUser.userId);
        console.log('🔑 user_id:', parsedUser.user_id);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem('user'); //ถ้าแปลงข้อมูลไม่สำเร็จ ให้ลบข้อมูลผู้ใช้เก่าออก
      }
    }
  }, []); //[] คือ รันครั้งเดียวตอนโหลดแอป เพื่อโหลดข้อมูลผู้ใช้ที่เก็บไว้ใน localStorage


  const fetchFlights = useCallback(async () => { //ดึงข้อมูลเที่ยวบินจาก API //useCallback เพื่อไม่ให้ฟังก์ชันเปลี่ยนถ้า dependencies ไม่เปลี่ยน
    try {
      const response = await api.get<any[]>('/flights') 
      const mappedFlights: Flight[] = response.data.map(mapFlightFromApi) //แปลงข้อมูลแต่ละรายการให้เป็นรูปแบบ Flight
      setFlights(mappedFlights)
      setSearch({ origin: '', destination: '', travelDate: '' })
    } catch (error) {
      console.error('Failed to fetch flights', error)
    }
  }, [])

  useEffect(() => {
    if (currentUser) { //ถ้ามีผู้ใช้ล็อกอินอยู่ ให้ดึงข้อมูลเที่ยวบิน
      fetchFlights()
    }
  }, [currentUser, fetchFlights])

  const handleAddFlight = async (newFlight: any) => {  //เพิ่มเที่ยวบินใหม่ (สำหรับ Admin)!!!
    try {
      console.log("🛠️ รับค่าจากฟอร์ม:", newFlight);

      const payload = { //เตรียมข้อมูลที่จะส่งไปยัง Backend
        flightCode: newFlight.flightCode ?? newFlight.flight_code, //รองรับทั้ง camelCase และ snake_case
        origin: newFlight.origin,
        destination: newFlight.destination,
        travelDate: newFlight.travelDate ?? newFlight.travel_date, 
        price: Number(newFlight.price),
        availableSeats: Number(newFlight.availableSeats ?? newFlight.available_seats), 
      }

      console.log("📦 กำลังส่งไป Backend:", payload);

      const response = await api.post<any>('/flights', payload)
      
      const created = mapFlightFromApi(response.data) //แปลงข้อมูลที่ได้จาก API ให้เป็นรูปแบบ Flight
      setFlights((prev) => [created, ...prev.filter((f) => f.flight_id !== created.flight_id)]) //เพิ่มเที่ยวบินใหม่ไว้ด้านบนสุดของรายการ
      //setFlights( คือไม่ต้องคอยกด refresh เอง ให้มันอัปเดตอัตโนมัติ


      // ✅ [UPDATE] ไม่ต้อง Alert ตรงนี้แล้ว เพราะใน AdminFlightManager มี Modal Success แล้ว
      // หรือถ้าจะให้ชัวร์ ใช้ Swal แจ้งเตือนเล็กๆ มุมขวาก็ได้
      const Toast = Swal.mixin({ 
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
        didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
      });
      Toast.fire({ icon: 'success', title: 'เพิ่มข้อมูลเรียบร้อย' });

    } catch (error: any) {
      console.error('❌ Failed to create flight:', error);
      const msg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      
      // ✅ [PREMIUM UI] เปลี่ยนจาก alert เป็น Swal Error 
      Swal.fire({
        icon: 'error', //ไอคอนรูปกากบาทสีแดง
        title: 'เพิ่มเที่ยวบินไม่สำเร็จ',
        text: Array.isArray(msg) ? msg.join(', ') : msg,
        confirmButtonColor: '#d33'
      });
      throw error;
    }
  }

  // 🔥 [UPDATED] แก้ไขฟังก์ชันลบให้เป็น Premium UI และแก้ Error
  const handleDeleteFlight = async (id: ID) => {
    // 1. ถามยืนยันด้วย UI สวยๆ (แทน window.confirm)
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบเที่ยวบินนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบเที่ยวบิน',
      cancelButtonText: 'ยกเลิก', 
      background: '#fff',
      color: '#000'
    });

    if (result.isConfirmed) { //ถ้าผู้ใช้กดยืนยันการลบ สั่งลบที่หลังบ้าน
      try {
        // 2. เรียก API ลบ
        console.log(`🗑️ Deleting flight ID: ${id}`);
        await api.delete(`/flights/${id}`); 
        
        // 3. อัปเดต State (ลบออกจากหน้าจอ)
        setFlights((prev) => prev.filter((f) => f.flight_id !== id)); //ลบเที่ยวบินออกจาก State ทันที ไม่ต้องรีเฟรช

        // 4. แจ้งเตือนสำเร็จ
        Swal.fire(
          'ลบสำเร็จ!',
          'เที่ยวบินถูกลบออกจากระบบแล้ว.',
          'success'
        );

      } catch (error: any) {
        console.error('Failed to delete flight', error); //กรณีโดนตัดหน้าลบ หาข้อมูลไม่เจอ
        
        // 5. จัดการ Error (กรณี 404 หรืออื่นๆ)
        if (error.response && error.response.status === 404) {
           // กรณีหาไม่เจอ (อาจจะลบไปแล้ว) ก็ให้อัปเดตหน้าจอไปเลย
           setFlights((prev) => prev.filter((f) => f.flight_id !== id));
           Swal.fire('ไม่พบข้อมูล', 'เที่ยวบินนี้อาจถูกลบไปแล้ว', 'info');
        } else {
           Swal.fire({
             icon: 'error',
             title: 'เกิดข้อผิดพลาด',
             text: 'ลบเที่ยวบินไม่สำเร็จ (กรุณาตรวจสอบสิทธิ์หรือการเชื่อมต่อ)',
           });
        }
      }
    }
  }

  const handleLogout = () => {
    // ✅ เพิ่ม Confirm ก่อน Logout เพื่อความหรูหรา
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff4d4f',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ออกจากระบบ'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null); //ล้างข้อมูลผู้ใช้ในสเตท หน้าจอเด้งกลับไปหน้า Login
        setSelectedFlight(null);
        setLatestBooking(null);
        
        const Toast = Swal.mixin({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
        });
        Toast.fire({ icon: 'success', title: 'ออกจากระบบเรียบร้อย' });
      }
    });
  };

  // ส่วนการค้นหาและกรองเที่ยวบิน
  const filteredFlights = useMemo(() => { //useMemoจำผลลัพธ์การกรองเที่ยวบิน เพื่อไม่ให้คำนวณซ้ำถ้า search หรือ flights ไม่เปลี่ยน
    const origin = (search.origin ?? '').trim().toLowerCase()//trim() คือ ตัดช่องว่างข้างหน้า/ข้างหลังออก
    const destination = (search.destination ?? '').trim().toLowerCase()//แปลงเป็นตัวพิมพ์เล็กทั้งหมด เพื่อให้การค้นหาไม่สนใจตัวพิมพ์ใหญ่/เล็ก
    const travelDate = search.travelDate ?? ''

    return flights
      .filter((f) => {
        const originOk = origin.length === 0 || f.origin.toLowerCase().includes(origin) //ถ้าช่องค้นหาว่าง หรือ ต้นทางตรงกับที่ค้นหา
        const destOk = destination.length === 0 || f.destination.toLowerCase().includes(destination) //ถ้าช่องค้นหาว่าง หรือ ปลายทางตรงกับที่ค้นหา
        const flightDate = toLocalYyyyMmDd(f.travel_date) //แปลงวันที่เที่ยวบินเป็นรูปแบบ YYYY-MM-DD
        const dateOk = travelDate.length === 0 || flightDate === travelDate;
        return originOk && destOk && dateOk //ต้องผ่านทั้ง 3 เงื่อนไขจึงจะเอาไว้แสดง && (AND operator
      })


      // ✅ [NEW] เรียงลำดับตามเวลาออกเดินทาง (น้อย -> มาก)
      // เที่ยวบินที่ออกเดินทางก่อน จะแสดงขึ้นมาเป็นอันดับแรก
      .sort((a, b) => {
        const dateA = new Date(a.travel_date).getTime();
        const dateB = new Date(b.travel_date).getTime();
        return dateA - dateB; 
      });


  }, [search.destination, search.origin, search.travelDate, flights]) //ถ้า search หรือ flights เปลี่ยน จะคำนวณผลลัพธ์ใหม่



  // ✅ Helper function: ดึง userId ที่ถูกต้อง
  const getUserId = (user: User | null): ID => { //รับข้อมูลผู้ใช้ (user) แล้วดึง userId ที่ถูกต้องออกมา
    if (!user) return 0;
    // ลองดึง userId (camelCase จาก Backend) ก่อน, ถ้าไม่มีใช้ user_id (snake_case)
    const id = user.userId ?? user.user_id ?? 0; // ??? คือ ถ้าข้างหน้าไม่มี ให้เอาข้างหลัง
    console.log('🆔 Getting userId:', { userId: user.userId, user_id: user.user_id, result: id });
    return id;
  };

  // =========================================================
  // 🔥 ส่วน UI: แยกการแสดงผลตามสถานะ Login
  // =========================================================

  // 1️⃣ กรณี "ยังไม่ Login": ใช้ Layout แบบ Full Screen + รูปพื้นหลัง (Classic Luxury Theme)
  if (!currentUser) { //ถ้ายังไม่มีผู้ใช้ล็อกอิน ให้แสดงหน้า Login
    return (
      <div style={{ 
        position: 'fixed', // บังคับเต็มจอ ทับทุกอย่าง
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999, // อยู่บนสุด
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
        position: 'sticky', top: 0, zIndex: 1000, //ให้อยู่บนสุดเวลาเลื่อนหน้า
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
          
          {currentUser.role === 'USER' && ( // ถ้าเป็น USER เท่านั้น ถึงจะแสดงปุ่มประวัติการจอง
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
           <FlightSearchForm onSearch={setSearch} /> //เมื่อผู้ใช้กดค้นหา จะเรียก setSearch เพื่ออัปเดตสเตท search
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
            
            <FlightList //แสดงรายการเที่ยวบินที่ผ่านการกรองแล้ว
              flights={filteredFlights}
              selectedFlightId={selectedFlight?.flight_id}
              onSelect={setSelectedFlight} //เมื่อผู้ใช้คลิกที่เที่ยวบิน จะเรียก setSelectedFlight เพื่ออัปเดตสเตท selectedFlight
            />
          </section>

          <section style={{ textAlign: 'left', position: 'sticky', top: '100px' }}>
            {selectedFlight ? ( //ถ้ามีเที่ยวบินที่ถูกเลือก จะแสดงแผงจองด้านขวา
              <BookingPanel 
                  userId={getUserId(currentUser)}
                  flight={selectedFlight}        
                  onBooked={(booking) => {       
                        setLatestBooking(booking);
                        setFlights(flights.map(f =>//อัปเดตจำนวนที่นั่งว่างหลังจากจองสำเร็จ ตัดสต็อกที่นั่ง 
                           f.flight_id === booking.flight_id //หาเที่ยวบินที่เพิ่งจอง
                           ? { ...f, available_seats: f.available_seats - booking.seat_count } //ลดจำนวนที่นั่งว่างลง
                           : f
                        ));
                  }} 
              />
            ) : ( //ถ้ายังไม่มีเที่ยวบินที่ถูกเลือก จะแสดงข้อความแนะนำให้เลือกเที่ยวบิน
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
            onClose={() => setShowMyBookings(false)}  //ปิด Modal
        />
      )}
    </div>
  )
}

export default App