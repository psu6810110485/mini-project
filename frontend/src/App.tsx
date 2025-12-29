import './App.css'

import { useMemo, useState } from 'react'
import { BookingPanel } from './components/BookingPanel'
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
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ textAlign: 'left' }}>
        <h1 style={{ margin: 0 }}>ระบบจองตั๋วเครื่องบิน</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Frontend (Strict Typing) — ตัวอย่างการผูก type กับข้อมูลจาก API</p>
      </header>

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
        </section>
      ) : null}
    </div>
  )
}

export default App
