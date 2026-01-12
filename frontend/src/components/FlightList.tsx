import type { Flight, ID } from '../types'

type FlightListProps = {
  flights: Flight[] // รายการเที่ยวบินที่จะแสดง [] หมายถึงมาเป็นกอง เที่ยวบินต่างๆ
  selectedFlightId?: ID // ไอดีของเที่ยวบินที่ถูกเลือก (ถ้ามี) เอาไว้ทำที่ไฮไลท์เวลาเอาเมาส์ไปคลิก กรอบเทาๆ
  onSelect: (flight: Flight) => void // ฟังก์ชันที่จะเรียกเมื่อมีการเลือกเที่ยวบิน ส่งข้อมูลไปให้ App.tsx แล้วต่อด้วย bookingpanel.tsx คำนวณ
}

function formatMoney(value: number | string): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(Number(value))
} // ฟังก์ชันแปลงตัวเลขเป็นรูปแบบเงินไทย แปลงเป็นตัวเลขก่อนเผื่อรับ string มา

export function FlightList({ flights, selectedFlightId, onSelect }: FlightListProps) {
  if (flights.length === 0) { // ถ้าไม่มีเที่ยวบินเลย
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '3rem', opacity: 0.3 }}>✈️</div>
        <p style={{ color: '#888', marginTop: '10px' }}>ไม่พบเที่ยวบินที่ค้นหา</p>
      </div>
    )
  }

  //โรงงานผลิตการ์ด (The Card Factory)
  return ( // ถ้ามีเที่ยวบิน
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {flights.map((f) => { // วนลูปสร้างการ์ดแต่ละใบ
        const isSelected = selectedFlightId === f.flight_id // ตรวจสอบว่าเที่ยวบินนี้ถูกเลือกหรือไม่ ใช่ใบที่จิ้มมั้ย
        const isAvailable = f.available_seats > 0 // ตรวจสอบว่ามีที่นั่งว่างหรือไม่

        return (
          <div 
            key={f.flight_id}  // ใส่ key เพื่อให้ React จัดการลิสต์ได้ถูกต้อง บาร์โค้ดประจำตัว .map ที่ได้ key ห้ามซ้ำกัน
            className={`flight-card ${isSelected ? 'selected' : ''}`} // ใส่คลาส selected ถ้าเป็นเที่ยวบินที่ถูกเลือก = flight-card selected   
            onClick={() => isAvailable && onSelect(f)} // ถ้ามีที่นั่งว่างถึงจะเรียก onSelect(f) เพื่อส่งข้อมูลเที่ยวบินที่เลือกไปข้างบน ถ้าไม่ว่างจะไม่ทำอะไร
            style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.6 }} //ตกแต่งเปลี่ยนเคอเซอถ้าไม่ว่าง
          >
            {/* โซนซ้าย: ข้อมูลการบิน */}
            <div className="flight-info-left">
               {/* โลโก้สมมติ */}
               <div className="airline-logo">✈️</div>
               
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                     <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {new Date(f.travel_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                     </span>
                     <span style={{ height: '2px', width: '50px', background: '#ddd', position: 'relative' }}>
                        {/* เครื่องบินจิ๋วตรงกลางเส้น */}
                        <span style={{ position: 'absolute', top: '-8px', left: '20px', fontSize: '12px' }}>✈</span>
                     </span>
                     <span style={{ color: '#888', fontSize: '0.9rem' }}>
                        {/* เวลาถึงปลายทางสมมติ (+1 ชม) */}
                        ปลายทาง
                     </span>
                  </div>
                  <div className="route-info">
                     {f.origin} <span style={{ color: '#ccc', fontSize: '0.8em' }}>➔</span> {f.destination}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '5px' }}>
                     {f.flight_code} • Direct Flight
                  </div>
               </div>
            </div>

            {/* โซนขวา: ราคา */}
            <div className="flight-price-right">
               <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>ราคา/ท่าน</div>
               <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--success)', lineHeight: 1 }}>
                  {formatMoney(f.price)}
               </div>
               
               {/* ปุ่มเลือก */}
               <button 
                  style={{ 
                     marginTop: '10px', 
                     width: '100%', 
                     padding: '8px', 
                     background: isSelected ? 'var(--primary-blue)' : 'white',
                     color: isSelected ? 'white' : 'var(--primary-blue)',
                     border: '1px solid var(--primary-blue)',
                     borderRadius: '4px',
                     fontWeight: 'bold',
                     cursor: 'pointer'
                  }}
               >
                  {isSelected ? 'เลือกแล้ว ✓' : 'เลือก'}
               </button>

               <div style={{ fontSize: '0.8rem', marginTop: '8px', color: f.available_seats < 5 ? 'red' : 'green' }}>
                  {f.available_seats < 5 ? `เหลือ ${f.available_seats} ที่นั่ง!` : `ว่าง ${f.available_seats} ที่`}
               </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}