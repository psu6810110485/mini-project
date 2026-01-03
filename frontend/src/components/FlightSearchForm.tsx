import { useState } from 'react'
import type { FlightSearchParams } from '../types'

type FlightSearchFormProps = {
  initialValue?: FlightSearchParams
  onSearch: (params: FlightSearchParams) => void
}

const DEFAULT_SEARCH: FlightSearchParams = { origin: '', destination: '', travelDate: '' }

export function FlightSearchForm({ initialValue, onSearch }: FlightSearchFormProps) {
  const [form, setForm] = useState<FlightSearchParams>(initialValue || DEFAULT_SEARCH)

  function updateField<K extends keyof FlightSearchParams>(key: K, value: FlightSearchParams[K]) {
    const updatedForm = { ...form, [key]: value }
    setForm(updatedForm)
    // Auto search disabled for pro feel (user clicks button), or keep it if you prefer
    // onSearch(...) 
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
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
        
        {/* ต้นทาง */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>บินจาก (From)</label>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🛫</span>
             <select
                value={form.origin ?? ''}
                onChange={(e) => updateField('origin', e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
             >
                <option value="">ทุกสนามบิน</option>
                <option value="BKK">กรุงเทพฯ (BKK)</option>
                <option value="DMK">ดอนเมือง (DMK)</option>
                <option value="CNX">เชียงใหม่ (CNX)</option>
                <option value="HKT">ภูเก็ต (HKT)</option>
                <option value="HDY">หาดใหญ่ (HDY)</option>
             </select>
          </div>
        </div>

        {/* ปลายทาง */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>บินไป (To)</label>
          <div style={{ position: 'relative' }}>
             <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🛬</span>
             <select
                value={form.destination ?? ''}
                onChange={(e) => updateField('destination', e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
             >
                <option value="">ทุกสนามบิน</option>
                <option value="BKK">กรุงเทพฯ (BKK)</option>
                <option value="DMK">ดอนเมือง (DMK)</option>
                <option value="CNX">เชียงใหม่ (CNX)</option>
                <option value="HKT">ภูเก็ต (HKT)</option>
                <option value="HDY">หาดใหญ่ (HDY)</option>
             </select>
          </div>
        </div>

        {/* วันที่ */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>วันเดินทาง</label>
          <input
            type="date"
            value={form.travelDate ?? ''}
            onChange={(e) => updateField('travelDate', e.target.value)}
            className="form-control"
          />
        </div>

        {/* ปุ่มค้นหา */}
        <div>
          <button type="submit" className="btn-gold" style={{ height: '48px', padding: '0 40px', fontSize: '1.1rem' }}>
            ค้นหา
          </button>
        </div>
      </div>
    </form>
  )
}