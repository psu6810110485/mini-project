import type { Flight, ID } from '../types'

type FlightListProps = {
  flights: Flight[]
  selectedFlightId?: ID
  onSelect: (flight: Flight) => void
}

// ✅ แก้ไขการคำนวณเงินให้รองรับทั้ง String และ Number เพื่อกัน NaN
function formatMoney(value: any): string {
  const amount = Number(value);
  return new Intl.NumberFormat('th-TH', { 
    style: 'currency', 
    currency: 'THB',
    minimumFractionDigits: 2 
  }).format(isNaN(amount) ? 0 : amount)
}

export function FlightList({ flights, selectedFlightId, onSelect }: FlightListProps) {
  if (flights.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>✈️ ไม่พบเที่ยวบินที่ตรงเงื่อนไขในขณะนี้</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }} aria-label="flight-results">
      <h3 style={{ color: 'white', marginBottom: '10px' }}>✈️ ผลการค้นหา ({flights.length})</h3>
      
      {flights.map((f: any) => {
        // ✅ เปลี่ยนจาก f.flightId เป็น f.flight_id ตาม Database
        const isSelected = selectedFlightId === f.flight_id 
        
        // ✅ เปลี่ยนจาก f.availableSeats เป็น f.available_seats
        const isAvailable = f.available_seats > 0 

        return (
          <button
            key={f.flight_id}
            type="button"
            onClick={() => onSelect(f)}
            className={`flight-card-premium ${isSelected ? 'selected' : ''}`}
            style={{
              opacity: isAvailable ? 1 : 0.6,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
            }}
            disabled={!isAvailable}
          >
            <div className="card-content">
              <div className="main-info">
                <div className="flight-route">
                  <span className="city">{f.origin}</span>
                  <span className="plane-divider">✈️</span>
                  <span className="city">{f.destination}</span>
                </div>
                
                <div className="flight-meta">
                  {/* ✅ ใช้ f.flight_code และ f.travel_date ให้ตรงกับ Backend */}
                  <span className="badge">Code: {f.flight_code}</span>
                  <span className="info-text">
                    📅 {new Date(f.travel_date).toLocaleDateString('th-TH', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span className={`seats-tag ${f.available_seats < 5 ? 'low' : ''}`}>
                    💺 ว่าง {f.available_seats} ที่นั่ง
                  </span>
                </div>
              </div>

              <div className="price-section">
                <div className="price-label">ราคาเริ่มต้น</div>
                <div className="price-value">{formatMoney(f.price)}</div>
                <div className="btn-book-ui">{isSelected ? 'เลือกอยู่' : 'เลือกเที่ยวบิน'}</div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}