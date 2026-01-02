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
  const [form, setForm] = useState<FlightSearchParams>(initialValue || DEFAULT_SEARCH)

  function updateField<K extends keyof FlightSearchParams>(key: K, value: FlightSearchParams[K]) {
    const updatedForm = { ...form, [key]: value }
    setForm(updatedForm)
    
    // ✅ ค้นหาอัตโนมัติทันทีที่เปลี่ยนค่า
    onSearch({
      origin: (updatedForm.origin ?? '').trim(),
      destination: (updatedForm.destination ?? '').trim(),
      travelDate: updatedForm.travelDate ?? '',
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSearch({
      origin: (form.origin ?? '').trim(),
      destination: (form.destination ?? '').trim(),
      travelDate: form.travelDate ?? '',
    })
  }

  return (
    <form onSubmit={handleSubmit} aria-label="flight-search" className="glass-panel" style={{ padding: '25px', textAlign: 'left' }}>
      <h2 style={{ fontFamily: 'Chonburi, serif', marginTop: 0, marginBottom: '20px', color: 'var(--rich-gold)' }}>
        ✈️ ค้นหาเที่ยวบิน
      </h2>
      
      <div style={{ display: 'grid', gap: 15, gridTemplateColumns: '1fr 1fr' }}>
        
        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontFamily: 'Prompt' }}>ต้นทาง</span>
          <select
            value={form.origin ?? ''}
            onChange={(e) => updateField('origin', e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: 'none', width: '100%', fontSize: '1rem', fontFamily: 'Prompt' }}
          >
            <option value="">ทุกสนามบิน</option>
            <option value="BKK">กรุงเทพฯ (สุวรรณภูมิ)</option>
            <option value="DMK">กรุงเทพฯ (ดอนเมือง)</option>
            <option value="CNX">เชียงใหม่</option>
            <option value="HKT">ภูเก็ต</option>
            <option value="HDY">หาดใหญ่</option>
          </select>
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontFamily: 'Prompt' }}>ปลายทาง</span>
          <select
            value={form.destination ?? ''}
            onChange={(e) => updateField('destination', e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: 'none', width: '100%', fontSize: '1rem', fontFamily: 'Prompt' }}
          >
            <option value="">ทุกสนามบิน</option>
            <option value="BKK">กรุงเทพฯ (สุวรรณภูมิ)</option>
            <option value="DMK">กรุงเทพฯ (ดอนเมือง)</option>
            <option value="CNX">เชียงใหม่</option>
            <option value="HKT">ภูเก็ต</option>
            <option value="HDY">หาดใหญ่</option>
          </select>
        </label>

        <label style={{ display: 'grid', gap: 8, gridColumn: '1 / span 2' }}>
          <span style={{ fontFamily: 'Prompt' }}>วันที่เดินทาง (ไม่บังคับ)</span>
          <input
            type="date"
            value={form.travelDate ?? ''}
            onChange={(e) => updateField('travelDate', e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: 'none', width: '100%', fontSize: '1rem', fontFamily: 'Prompt' }}
          />
        </label>

        <div style={{ gridColumn: '1 / span 2', marginTop: '10px' }}>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            ค้นหาเที่ยวบิน
          </button>
        </div>
      </div>
    </form>
  )
}