import { useState } from 'react'
import type { FlightSearchParams } from '../types'

type FlightSearchFormProps = {
  initialValue?: FlightSearchParams // ค่าเริ่มต้นของฟอร์มการค้นหา
  onSearch: (params: FlightSearchParams) => void // onSearch ฟังก์ชัน callback เมื่อกดค้นหา ส่งการค้นหาไป app.tsx
}

const DEFAULT_SEARCH: FlightSearchParams = { origin: '', destination: '', travelDate: '' } // ค่าเริ่มต้นของการค้นหา

// ฟอร์มการค้นหาเที่ยวบิน
export function FlightSearchForm({ initialValue, onSearch }: FlightSearchFormProps) {
  const [form, setForm] = useState<FlightSearchParams>(initialValue || DEFAULT_SEARCH) // ใช้ useState เพื่อเก็บสถานะของฟอร์มการค้นหา initialValue หรือ ค่าเริ่มต้น



  function updateField<K extends keyof FlightSearchParams>(key: K, value: FlightSearchParams[K]) { //K extends keyof ตรวจสอบ key ว่าเป็น key ของ FlightSearchParams หรือไม่
    const updatedForm = { ...form, [key]: value }// อัปเดตฟิลด์ในฟอร์มจากของเดิม
    setForm(updatedForm) // อัปเดตสถานะฟอร์ม
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() // ป้องกันการรีเฟรชหน้าเมื่อส่งฟอร์ม
    onSearch({ 
      origin: (form.origin ?? '').trim(), // trim() เพื่อลบช่องว่างด้านหน้าและหลัง ใส่ ?? เอาข้อความว่าง '' เผื่อค่าเป็น undefined
      destination: (form.destination ?? '').trim(), 
      travelDate: form.travelDate ?? '', 
    })
  }

  // ✅ [NEW] ฟังก์ชันสำหรับล้างค่าการค้นหา
  function handleClear() {
    setForm(DEFAULT_SEARCH); // รีเซ็ตฟอร์มเป็นค่าว่าง
    onSearch(DEFAULT_SEARCH); // สั่งค้นหาใหม่แบบไม่กรอง (แสดงทั้งหมด)
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

        {/* ✅ บรรทัดที่ 2: ปุ่มควบคุม (ค้นหา และ ล้างค่า) */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', // จัดให้อยู่กึ่งกลางแนวตั้ง
            marginTop: '10px',
            gap: '30px' // ✅ [NEW] เว้นระยะห่างระหว่างปุ่มตามที่ขอ
        }}>
          
          {/* ปุ่มค้นหา */}
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

          {/* ✅ [NEW] ปุ่มล้างค่า (Clear) - เพิ่มใหม่ด้านขวา */}
          <button 
            type="button" 
            onClick={handleClear}
            className="btn-clear"
            style={{
                height: '50px',
                padding: '0 25px',
                fontSize: '1rem',
                borderRadius: '50px',
                border: '1px solid #ccc',
                background: 'transparent',
                color: '#888',
                fontWeight: 500,
                fontFamily: 'Prompt',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#ff4d4f';
                e.currentTarget.style.color = '#ff4d4f';
                e.currentTarget.style.backgroundColor = 'rgba(255, 77, 79, 0.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.color = '#888';
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🧹</span>
            <span>ล้างค่า</span>
          </button>

        </div>

      </div>

      {/* ✅ เพิ่ม CSS สำหรับ Focus Effect และ Responsive */}
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
          /* ให้ปุ่มเรียงแนวตั้งบนมือถือ */
          form > div > div:last-child {
             flex-direction: column;
             gap: 15px;
          }
          .btn-gold, .btn-clear {
             width: 100%;
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