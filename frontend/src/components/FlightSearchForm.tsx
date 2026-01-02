import { useState } from 'react'
import type { FlightSearchParams } from '../types'

type FlightSearchFormProps = {
  initialValue?: FlightSearchParams
  onSearch: (params: FlightSearchParams) => void
}

const DEFAULT_SEARCH: FlightSearchParams = {
  origin: '',
  destination: '',
  travelDate: '',
}

export function FlightSearchForm({ initialValue, onSearch }: FlightSearchFormProps) {
  const [form, setForm] = useState<FlightSearchParams>(initialValue ?? DEFAULT_SEARCH)

<<<<<<< Updated upstream
  const canSearch = useMemo(() => {
    return form.origin.trim().length > 0 && form.destination.trim().length > 0
  }, [form.destination, form.origin])

=======
>>>>>>> Stashed changes
  function updateField<K extends keyof FlightSearchParams>(key: K, value: FlightSearchParams[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSearch) return
    onSearch({
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      travelDate: form.travelDate,
    })
  }

  return (
    <form onSubmit={handleSubmit} aria-label="flight-search">
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr 1fr auto' }}>
        <label style={{ display: 'grid', gap: 6, textAlign: 'left' }}>
          <span>ต้นทาง</span>
          <input
            value={form.origin}
            onChange={(e) => updateField('origin', e.target.value)}
            placeholder="เช่น BKK"
            autoComplete="off"
          />
        </label>

        <label style={{ display: 'grid', gap: 6, textAlign: 'left' }}>
          <span>ปลายทาง</span>
          <input
            value={form.destination}
            onChange={(e) => updateField('destination', e.target.value)}
            placeholder="เช่น CNX"
            autoComplete="off"
          />
        </label>

        <label style={{ display: 'grid', gap: 6, textAlign: 'left' }}>
          <span>วันที่เดินทาง</span>
          <input
            type="date"
            value={form.travelDate}
            onChange={(e) => updateField('travelDate', e.target.value)}
          />
        </label>

        <div style={{ alignSelf: 'end' }}>
          <button type="submit" disabled={!canSearch}>
            ค้นหา
          </button>
        </div>
      </div>
    </form>
  )
}
