import type { Flight, ID } from '../types'

type FlightListProps = {
  flights: Flight[]
  selectedFlightId?: ID
  onSelect: (flight: Flight) => void
}

function formatMoney(value: number | string): string {
  const amount = Number(value); // แปลงเป็นตัวเลขเสมอ
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
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'Prompt' }}>✈️ ไม่พบเที่ยวบินที่ตรงเงื่อนไขในขณะนี้</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '15px' }} aria-label="flight-results">
      {flights.map((f) => {
        const isSelected = selectedFlightId === f.flight_id 
        const isAvailable = f.available_seats > 0 

        return (
          <button
            key={f.flight_id}
            type="button"
            onClick={() => onSelect(f)}
            className={`flight-card-premium ${isSelected ? 'selected' : ''}`}
            style={{
              textAlign: 'left',
              padding: '0', 
              border: isSelected ? '2px solid var(--rich-gold)' : '1px solid rgba(197, 160, 89, 0.3)',
              opacity: isAvailable ? 1 : 0.6,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              background: isSelected ? 'rgba(255,255,255, 0.95)' : 'rgba(255,255,255, 0.9)',
              transition: 'all 0.3s ease',
              width: '100%',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: isSelected ? '0 10px 25px rgba(197, 160, 89, 0.4)' : '0 4px 10px rgba(0,0,0,0.1)'
            }}
            disabled={!isAvailable}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
              <div style={{ padding: '20px', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.4rem', fontFamily: 'Chonburi', color: 'var(--royal-blue)', marginBottom: '8px' }}>
                  {f.flight_code} <span style={{ color: '#ccc', margin: '0 5px' }}>|</span> {f.origin} ➝ {f.destination}
                </div>
                <div style={{ fontSize: '0.95rem', fontFamily: 'Prompt', color: '#555', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <span>
                    📅 {new Date(f.travel_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ color: f.available_seats < 5 ? '#e74c3c' : '#28a745', fontWeight: 'bold' }}>
                    💺 ว่าง: {f.available_seats}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)', borderLeft: '2px dashed #ccc', minWidth: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'Prompt' }}>ราคาเริ่มต้น</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-green)', fontFamily: 'Prompt' }}>
                  {formatMoney(f.price)}
                </div>
                {isSelected && (
                  <div style={{ fontSize: '0.8rem', color: 'white', background: 'var(--rich-gold)', padding: '2px 8px', borderRadius: '10px', marginTop: '5px', fontFamily: 'Prompt' }}>
                    เลือกอยู่ ✅
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}