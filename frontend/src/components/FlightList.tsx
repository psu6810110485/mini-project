import type { Flight, ID } from '../types'

type FlightListProps = {
  flights: Flight[]
  selectedFlightId?: ID
  onSelect: (flight: Flight) => void
}

function formatMoney(value: number | string): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(Number(value))
}

export function FlightList({ flights, selectedFlightId, onSelect }: FlightListProps) {
  if (flights.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '3rem', opacity: 0.3 }}>✈️</div>
        <p style={{ color: '#888', marginTop: '10px' }}>ไม่พบเที่ยวบินที่ค้นหา</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {flights.map((f) => {
        const isSelected = selectedFlightId === f.flight_id 
        const isAvailable = f.available_seats > 0 

        return (
          <div 
            key={f.flight_id} 
            className={`flight-card ${isSelected ? 'selected' : ''}`}
            onClick={() => isAvailable && onSelect(f)}
            style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.6 }}
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