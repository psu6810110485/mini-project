import type { Flight, ID } from '../types'

type FlightListProps = {
  flights: Flight[]
  selectedFlightId?: ID
  onSelect: (flight: Flight) => void
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)
}

export function FlightList({ flights, selectedFlightId, onSelect }: FlightListProps) {
  if (flights.length === 0) {
    return <p style={{ textAlign: 'left' }}>ไม่พบเที่ยวบินที่ตรงเงื่อนไข</p>
  }

  return (
    <div style={{ display: 'grid', gap: 10 }} aria-label="flight-results">
      {flights.map((f) => {
        const isSelected = selectedFlightId === f.flightId
        return (
          <button
            key={f.flightId}
            type="button"
            onClick={() => onSelect(f)}
            style={{
              textAlign: 'left',
              padding: 12,
              borderRadius: 8,
              border: '1px solid',
              opacity: f.availableSeats > 0 ? 1 : 0.6,
            }}
            disabled={f.availableSeats <= 0}
            aria-pressed={isSelected}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {f.flightCode} — {f.origin} → {f.destination}
                </div>
                <div style={{ fontSize: 14 }}>
                  วันที่: {new Date(f.travelDate).toLocaleString('th-TH')} • ที่นั่งเหลือ: {f.availableSeats}
                </div>
              </div>
              <div style={{ fontWeight: 600 }}>{formatMoney(f.price)}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
