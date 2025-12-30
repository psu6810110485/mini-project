import { useMemo, useState } from 'react'
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
  // ใช้ค่าเริ่มต้นหรือค่าว่างเพื่อป้องกัน undefined
  const [form, setForm] = useState<FlightSearchParams>(initialValue || DEFAULT_SEARCH)

  // ✅ แก้ตัวแดง: ดักค่า undefined ก่อน .trim()
  const canSearch = useMemo(() => {
    const origin = form.origin || '';
    const destination = form.destination || '';
    return origin.trim().length > 0 && destination.trim().length > 0
  }, [form.destination, form.origin])

  function updateField<K extends keyof FlightSearchParams>(key: K, value: FlightSearchParams[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSearch) return
    onSearch({
      origin: (form.origin || '').trim(),
      destination: (form.destination || '').trim(),
      travelDate: form.travelDate || '',
    })
  }

  return (
    <form onSubmit={handleSubmit} aria-label="flight-search" className="glass-panel" style={{ padding: '25px', textAlign: 'left' }}>
      {/* ✅ เพิ่มสีทอง (var(--rich-gold)) ให้หัวข้อเข้ากับธีม */}
      <h2 style={{ fontFamily: 'Chonburi, serif', marginTop: 0, marginBottom: '20px', color: 'var(--rich-gold)' }}>
        ✈️ ค้นหาเที่ยวบิน
      </h2>
      
      <div style={{ display: 'grid', gap: 15, gridTemplateColumns: '1fr 1fr' }}>
        
        {/* ✅ 1. ต้นทาง (Origin) แบบ Dropdown */}
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontFamily: 'Prompt' }}>ต้นทาง</span>
          <select
            value={form.origin || ''}
            onChange={(e) => updateField('origin', e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: 'none', width: '100%', fontSize: '1rem', fontFamily: 'Prompt' }}
          >
            <option value="">เลือกสนามบินต้นทาง</option>
            <option value="BKK">กรุงเทพฯ (สุวรรณภูมิ)</option>
            <option value="DMK">กรุงเทพฯ (ดอนเมือง)</option>
            <option value="CNX">เชียงใหม่</option>
            <option value="HKT">ภูเก็ต</option>
            <option value="HDY">หาดใหญ่</option>
          </select>
        </label>

        {/* ✅ 2. ปลายทาง (Destination) แบบ Dropdown */}
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontFamily: 'Prompt' }}>ปลายทาง</span>
          <select
            value={form.destination || ''}
            onChange={(e) => updateField('destination', e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: 'none', width: '100%', fontSize: '1rem', fontFamily: 'Prompt' }}
          >
            <option value="">เลือกสนามบินปลายทาง</option>
            <option value="BKK">กรุงเทพฯ (สุวรรณภูมิ)</option>
            <option value="DMK">กรุงเทพฯ (ดอนเมือง)</option>
            <option value="CNX">เชียงใหม่</option>
            <option value="HKT">ภูเก็ต</option>
            <option value="HDY">หาดใหญ่</option>
          </select>
        </label>

        {/* ✅ 3. วันที่เดินทาง (Date) */}
        <label style={{ display: 'grid', gap: 8, gridColumn: '1 / span 2' }}>
          <span style={{ fontFamily: 'Prompt' }}>วันที่เดินทาง</span>
          <input
            type="date"
            value={form.travelDate || ''}
            onChange={(e) => updateField('travelDate', e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: 'none', width: '100%', fontSize: '1rem', fontFamily: 'Prompt' }}
          />
        </label>

        <div style={{ gridColumn: '1 / span 2', marginTop: '10px' }}>
          <button type="submit" disabled={!canSearch} className="btn-primary" style={{ width: '100%' }}>
            ค้นหาเที่ยวบิน
          </button>
        </div>
      </div>
    </form>
  )
}