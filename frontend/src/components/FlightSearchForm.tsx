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
      {/* ✅ แก้ไข: แยก Grid เป็น 2 ส่วน - บรรทัดแรก 3 ช่อง, บรรทัดที่ 2 ปุ่มค้นหา */}
      <div style={{ display: 'grid', gap: '15px' }}>
        
        {/* บรรทัดแรก: ต้นทาง, ปลายทาง, วันที่ */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '15px', 
          alignItems: 'end',
          maxWidth: '100%'
        }}>
          
          {/* ต้นทาง */}
          <div style={{ minWidth: 0 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              color: '#666', 
              marginBottom: '8px',
              fontFamily: 'Prompt',
              fontWeight: 600
            }}>
              บินจาก (From)
            </label>
            <div style={{ position: 'relative' }}>
               <span style={{ 
                 position: 'absolute', 
                 left: '12px', 
                 top: '50%', 
                 transform: 'translateY(-50%)',
                 fontSize: '1.2rem',
                 zIndex: 1
               }}>
                 🛫
               </span>
               <select
                  value={form.origin ?? ''}
                  onChange={(e) => updateField('origin', e.target.value)}
                  className="form-control"
                  style={{ 
                    paddingLeft: '40px',
                    width: '100%',
                    height: '48px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    fontFamily: 'Prompt',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
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
          <div style={{ minWidth: 0 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              color: '#666', 
              marginBottom: '8px',
              fontFamily: 'Prompt',
              fontWeight: 600
            }}>
              บินไป (To)
            </label>
            <div style={{ position: 'relative' }}>
               <span style={{ 
                 position: 'absolute', 
                 left: '12px', 
                 top: '50%', 
                 transform: 'translateY(-50%)',
                 fontSize: '1.2rem',
                 zIndex: 1
               }}>
                 🛬
               </span>
               <select
                  value={form.destination ?? ''}
                  onChange={(e) => updateField('destination', e.target.value)}
                  className="form-control"
                  style={{ 
                    paddingLeft: '40px',
                    width: '100%',
                    height: '48px',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    fontFamily: 'Prompt',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxSizing: 'border-box'
                  }}
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

          {/* ✅ วันที่ - เพิ่ม Icon ปฏิทินและปรับ Style */}
          <div style={{ minWidth: 0 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              color: '#666', 
              marginBottom: '8px',
              fontFamily: 'Prompt',
              fontWeight: 600
            }}>
              วันเดินทาง
            </label>
            <div style={{ position: 'relative' }}>
              {/* ✅ Icon ปฏิทิน */}
              <span style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                fontSize: '1.2rem',
                zIndex: 1,
                pointerEvents: 'none'
              }}>
                📅
              </span>
              <input
                type="date"
                value={form.travelDate ?? ''}
                onChange={(e) => updateField('travelDate', e.target.value)}
                className="form-control"
                style={{
                  paddingLeft: '40px',
                  width: '100%',
                  height: '48px',
                  borderRadius: '10px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  fontFamily: 'Prompt',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  colorScheme: 'light',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* ✅ บรรทัดที่ 2: ปุ่มค้นหา - แยกออกมาคนละบรรทัด */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
          <button 
            type="submit" 
            className="btn-gold" 
            style={{ 
              height: '50px', 
              padding: '0 50px', 
              fontSize: '1.1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)',
              color: '#0D253F',
              fontWeight: 'bold',
              fontFamily: 'Prompt',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.3s',
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.4)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <span>ค้นหา</span>
          </button>
        </div>

      </div>

      {/* ✅ เพิ่ม CSS สำหรับ Focus Effect */}
      <style>{`
        .form-control:focus {
          outline: none;
          border-color: #D4AF37 !important;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2) !important;
        }

        .form-control:hover {
          border-color: #C5A028 !important;
        }

        /* ✅ ปรับ Date Picker ให้ปุ่มปฏิทินชัดเจน */
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          font-size: 1.2rem;
          padding: 4px;
          margin-right: 4px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
          background-color: rgba(212, 175, 55, 0.1);
          border-radius: 4px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          form > div > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }

        /* ✅ ป้องกันช่อง Input ล้นออกนอกกรอบ */
        .form-control {
          max-width: 100%;
          box-sizing: border-box;
        }
      `}</style>
    </form>
  )
}