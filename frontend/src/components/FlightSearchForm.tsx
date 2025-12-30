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
  const [form, setForm] = useState<FlightSearchParams>(initialValue ?? DEFAULT_SEARCH)

  // ✅ แก้ตัวแดง: ใช้ (ค่า || '') เพื่อป้องกัน undefined ก่อน .trim()
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
    <form onSubmit={handleSubmit} aria-label="flight-search" className="glass-panel" style={{ padding: '20px', textAlign: 'left' }}>
      <h2 style={{ fontFamily: 'Chonburi, serif', marginTop: 0, marginBottom: '20px' }}>✈️ ค้นหาเที่ยวบิน</h2>
      
      <div style={{ display: 'grid', gap: 15, gridTemplateColumns: '1fr 1fr' }}>
        
        {/* ✅ เปลี่ยนเป็น Dropdown เลือกสนามบินต้นทาง */}
        <label style={{ display: 'grid', gap: 6 }}>
          <span>ต้นทาง (Origin)</span>
          <select
            value={form.origin || ''}
            onChange={(e) => updateField('origin', e.target.value)}
            style={{ padding: '12px', borderRadius: '10px', border: 'none', width: '100%' }}
          >
            <option value="">เลือกสนามบินต้นทาง</option>
            <option value="BKK">กรุงเทพฯ (สุวรรณภูมิ)</option>
            <option value="DMK">กรุงเทพฯ (ดอนเมือง)</option>
            <option value="CNX">เชียงใหม่</option>
            <option value="HKT">ภูเก็ต</option>
            <option value="HDY">หาดใหญ่</option>
          </select>
        </label>

        {/* ✅ เปลี่ยนเป็น Dropdown เลือกสนามบินปลายทาง */}
        <label style={{ display: 'grid', gap: 6 }}>
          <span>ปลายทาง (Destination)</span>
          <select
            value={form.destination || ''}
            onChange={(e) => updateField('destination', e.target.value)}
            style={{ padding: '12px', borderRadius: '10px', border: 'none', width: '100%' }}
          >
            <option value="">เลือกสนามบินปลายทาง</option>
            <option value="BKK">กรุงเทพฯ (สุวรรณภูมิ)</option>
            <option value="DMK">กรุงเทพฯ (ดอนเมือง)</option>
            <option value="CNX">เชียงใหม่</option>
            <option value="HKT">ภูเก็ต</option>
            <option value="HDY">หาดใหญ่</option>
          </select>
        </label>

        {/* ช่องวันที่ */}
        <label style={{ display: 'grid', gap: 6, gridColumn: '1 / span 2' }}>
          <span>วันที่เดินทาง (Date)</span>
          <input
            type="date"
            value={form.travelDate || ''}
            onChange={(e) => updateField('travelDate', e.target.value)}
            style={{ padding: '12px', borderRadius: '10px', border: 'none', width: '100%' }}
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