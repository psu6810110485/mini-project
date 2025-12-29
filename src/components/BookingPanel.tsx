import { useMemo, useState } from 'react'
import type { Booking, BookingStatus, Flight, ID, IsoDateTimeString } from '../types'

type BookingPanelProps = {
  userId: ID
  flight: Flight
  onBooked: (booking: Booking) => void
}

function computeTotalPrice(price: number, seatCount: number): number {
  return price * seatCount
}

function nowIso(): IsoDateTimeString {
  return new Date().toISOString()
}

export function BookingPanel({ userId, flight, onBooked }: BookingPanelProps) {
  const [seatCount, setSeatCount] = useState<number>(1)
  const [status, setStatus] = useState<BookingStatus>('pending')

  const maxSeats = Math.max(0, flight.availableSeats)

  const totalPrice = useMemo(() => {
    const normalizedSeats = Math.min(Math.max(seatCount, 1), Math.max(maxSeats, 1))
    return computeTotalPrice(flight.price, normalizedSeats)
  }, [flight.price, maxSeats, seatCount])

  function handleSeatChange(value: number) {
    const next = Number.isFinite(value) ? value : 1
    setSeatCount(Math.min(Math.max(next, 1), Math.max(maxSeats, 1)))
  }

  function handleBook() {
    if (maxSeats <= 0) return

    const booking: Booking = {
      bookingId: Date.now(),
      userId,
      flightId: flight.flightId,
      seatCount: Math.min(Math.max(seatCount, 1), Math.max(maxSeats, 1)),
      totalPrice,
      status: 'confirmed',
      bookingTime: nowIso(),
    }

    setStatus('confirmed')
    onBooked(booking)
  }

  return (
    <section aria-label="booking-panel" style={{ textAlign: 'left' }}>
      <h2 style={{ marginTop: 0 }}>จองเที่ยวบิน</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 600 }}>
            {flight.flightCode} — {flight.origin} → {flight.destination}
          </div>
          <div style={{ fontSize: 14 }}>วันที่: {new Date(flight.travelDate).toLocaleString('th-TH')}</div>
        </div>

        <label style={{ display: 'grid', gap: 6, maxWidth: 220 }}>
          <span>จำนวนที่นั่ง</span>
          <input
            type="number"
            min={1}
            max={Math.max(maxSeats, 1)}
            value={seatCount}
            onChange={(e) => handleSeatChange(e.target.valueAsNumber)}
          />
        </label>

        <div>ราคารวม: {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(totalPrice)}</div>
        <div>สถานะ: {status}</div>

        <div>
          <button type="button" onClick={handleBook} disabled={maxSeats <= 0}>
            ยืนยันการจอง
          </button>
        </div>
      </div>
    </section>
  )
}
