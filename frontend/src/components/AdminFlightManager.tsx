// frontend/src/components/AdminFlightManager.tsx

import React, { useState } from 'react';
import axios from 'axios'; // ✅ เพิ่ม axios เข้ามาเพื่อจัดการ API
import type { Flight, ID } from '../types';

interface AdminFlightManagerProps {
  flights: Flight[];
  onAddFlight: (flight: Flight) => Promise<void> | void;
  onDeleteFlight: (id: ID) => void | Promise<void>;
}

export const AdminFlightManager: React.FC<AdminFlightManagerProps> = ({ flights, onAddFlight, onDeleteFlight }) => {
  // =========================================================================
  // --- PART 1: EXISTING STATE (State เดิม ห้ามลบ) ---
  // =========================================================================
  
  const [newFlight, setNewFlight] = useState<Partial<Flight>>({
    flight_code: '',
    origin: '',
    destination: '',
    travel_date: '',
    price: 0,
    available_seats: 0,
    status: 'Active'
  });

  // State สำหรับ Modal ลบ (Logic เดิม)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flightIdToDelete, setFlightIdToDelete] = useState<ID | null>(null);

  // 🔥 [NEW] State สำหรับ Modal เพิ่มสำเร็จ (Premium Success)
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // =========================================================================
  // --- PART 2: LOGIC HANDLERS (Logic แก้ไขให้ทำงานได้จริง) ---
  // =========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const flightToAdd: Flight = {
      flight_id: Date.now(),
      flight_code: newFlight.flight_code || 'TG999',
      origin: newFlight.origin || 'BKK',
      destination: newFlight.destination || 'CNX',
      travel_date: newFlight.travel_date || new Date().toISOString(),
      price: Number(newFlight.price) || 0,
      available_seats: Number(newFlight.available_seats) || 0,
      status: 'Active'
    };

    try {
      await onAddFlight(flightToAdd);

      setNewFlight({
        flight_code: '', origin: '', destination: '', travel_date: '',
        price: 0, available_seats: 0, status: 'Active'
      });
      
      // 🔥 [UPDATED] เปิด Modal สุดหรู (ไม่ต้องใช้ alert)
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Create flight failed', error);
      // ❌ ลบ alert('เพิ่มเที่ยวบินไม่สำเร็จ') ออกเพื่อความ Premium
      // อาจจะเพิ่ม State ErrorModal ได้ในอนาคต แต่ตอนนี้ใช้ console ไปก่อนเพื่อไม่ให้ popup กวนใจ
    }
  };

  const handleRequestDelete = (id: ID) => {
    setFlightIdToDelete(id);
    setShowDeleteModal(true);
  };

  // 🔥 [CRITICAL UPDATE] แก้ไขฟังก์ชันนี้เพื่อให้ Admin ลบได้จริง!
  const handleConfirmDelete = async () => {
    if (flightIdToDelete) {
      try {
        // 1. ดึง Token จาก Storage (สำคัญมาก Admin ต้องมีสิ่งนี้)
        const token = localStorage.getItem('token'); 
        
        // 2. เรียก API ลบโดยตรง พร้อมแนบ Header (แก้ปัญหา Permission Denied)
        // ⚠️ ตรวจสอบ URL: http://localhost:3000/flights ให้ตรงกับ Backend ของคุณ
        await axios.delete(`http://localhost:3000/flights/${flightIdToDelete}`, {
          headers: {
            Authorization: `Bearer ${token}` // ✅ กุญแจสำคัญที่ทำให้ลบได้
          }
        });

        // 3. อัปเดต UI (เรียก function จาก props เพื่อลบรายการออกจากหน้าจอ)
        await onDeleteFlight(flightIdToDelete);
        
        // 4. ปิด Modal
        setShowDeleteModal(false);
        setFlightIdToDelete(null);

      } catch (error) {
        console.error("Delete failed:", error);
        // ถ้าลบพลาด ปิด Modal ไปก่อน หรือจะแสดง Error Modal ก็ได้
        // แต่ห้ามใช้ alert() ถ้าอยากได้ความ Premium
        setShowDeleteModal(false); 
      }
    }
  };

  // =========================================================================
  // --- PART 3: PREMIUM UI RENOVATION (Full Code - No Reduction) ---
  // =========================================================================

  // Style สำหรับ Input (คงเดิมจากรอบที่แล้วที่จัดระเบียบไว้)
  const commonInputStyle = {
    width: '100%', height: '52px', padding: '0 15px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)',
    color: '#fff', fontFamily: 'Prompt', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box' as const, display: 'flex', alignItems: 'center'
  };

  return (
    <>
      {/* Container หลัก */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
        borderRadius: '24px', padding: '40px', marginBottom: '40px',
        border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '20px' }}>
            <span style={{ fontSize: '2.2rem' }}>🛠️</span>
            <h2 style={{ fontFamily: 'Chonburi', color: '#D4AF37', margin: 0, fontSize: '2rem', letterSpacing: '1.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                จัดการเที่ยวบิน (Admin)
            </h2>
        </div>

        {/* --- FORM เพิ่มเที่ยวบิน --- */}
        <form onSubmit={handleSubmit} style={{ 
            background: 'rgba(255,255,255,0.03)', padding: '35px', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)', marginBottom: '50px'
        }}>
          <h4 style={{ fontFamily: 'Prompt', color: '#fff', margin: '0 0 25px 0', borderLeft: '4px solid #D4AF37', paddingLeft: '15px', fontSize: '1.2rem' }}>
             เพิ่มเที่ยวบินใหม่
          </h4>

          {/* Grid Layout: เขียนแยกทีละ field เพื่อไม่ให้โค้ดลดลง */}
          <div style={{ display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            
            {/* 1. Flight Code */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>รหัสเที่ยวบิน</label>
              <input 
                type="text" 
                placeholder="เช่น TG101" 
                value={newFlight.flight_code} 
                onChange={e => setNewFlight({...newFlight, flight_code: e.target.value})} 
                required 
                style={commonInputStyle} 
              />
            </div>

            {/* 2. Origin */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>ต้นทาง</label>
              <select 
                value={newFlight.origin} 
                onChange={e => setNewFlight({...newFlight, origin: e.target.value})} 
                required 
                style={{ ...commonInputStyle, background: '#1e293b', cursor: 'pointer' }}
              >
                <option value="">เลือกต้นทาง</option>
                <option value="BKK">Suvarnabhumi (BKK)</option>
                <option value="DMK">Don Mueang (DMK)</option>
                <option value="CNX">Chiang Mai (CNX)</option>
                <option value="HKT">Phuket (HKT)</option>
                <option value="HDY">Hatyai (HDY)</option>
              </select>
            </div>

            {/* 3. Destination */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>ปลายทาง</label>
              <select 
                value={newFlight.destination} 
                onChange={e => setNewFlight({...newFlight, destination: e.target.value})} 
                required 
                style={{ ...commonInputStyle, background: '#1e293b', cursor: 'pointer' }}
              >
                <option value="">เลือกปลายทาง</option>
                <option value="BKK">Suvarnabhumi (BKK)</option>
                <option value="DMK">Don Mueang (DMK)</option>
                <option value="CNX">Chiang Mai (CNX)</option>
                <option value="HKT">Phuket (HKT)</option>
                <option value="HDY">Hatyai (HDY)</option>
              </select>
            </div>

            {/* 4. Date */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>วันเวลาเดินทาง</label>
              <input 
                type="datetime-local" 
                value={newFlight.travel_date} 
                onChange={e => setNewFlight({...newFlight, travel_date: e.target.value})} 
                required 
                style={commonInputStyle} 
              />
            </div>

            {/* 5. Price */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>ราคา (บาท)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={newFlight.price || ''} 
                onChange={e => setNewFlight({...newFlight, price: Number(e.target.value)})} 
                required 
                style={commonInputStyle} 
              />
            </div>

            {/* 6. Available Seats */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'Prompt', color: '#ccc', fontSize: '0.9rem' }}>ที่นั่งว่าง</label>
              <input 
                type="number" 
                placeholder="จำนวน" 
                value={newFlight.available_seats || ''} 
                onChange={e => setNewFlight({...newFlight, available_seats: Number(e.target.value)})} 
                required 
                style={commonInputStyle} 
              />
            </div>
          </div>

          <div style={{ marginTop: '35px' }}>
            <button type="submit" style={{ 
                width: '100%', padding: '16px', borderRadius: '50px', border: 'none',
                background: 'linear-gradient(90deg, #D4AF37 0%, #C5A028 100%)',
                color: '#000', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(212, 175, 55, 0.3)', transition: 'all 0.3s', fontFamily: 'Prompt'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(212, 175, 55, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.3)'; }}
            >
              + เพิ่มเที่ยวบินใหม่
            </button>
          </div>
        </form>

        {/* --- ตารางแสดงข้อมูล --- */}
        <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h3 style={{ fontFamily: 'Chonburi', color: '#fff', margin: 0, fontSize: '1.6rem' }}>
                รายการเที่ยวบิน ({flights.length})
            </h3>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>
        
        <div style={{ overflowX: 'auto', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontFamily: 'Prompt', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', textAlign: 'left' }}>
                <th style={{ padding: '20px' }}>Code</th><th style={{ padding: '20px' }}>Route</th><th style={{ padding: '20px' }}>Date</th><th style={{ padding: '20px' }}>Price</th><th style={{ padding: '20px' }}>Seats</th><th style={{ padding: '20px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f, index) => (
                <tr key={f.flight_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '20px', fontWeight: 'bold' }}><span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', color: '#fff', fontSize: '0.95rem' }}>{f.flight_code}</span></td>
                  <td style={{ padding: '20px', color: '#ccc' }}><span style={{ color: '#fff', fontWeight: 'bold' }}>{f.origin}</span> <span style={{ margin: '0 10px', color: '#D4AF37', fontSize: '1.1rem' }}>✈</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>{f.destination}</span></td>
                  <td style={{ padding: '20px', color: '#aaa' }}>{new Date(f.travel_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute:'2-digit' })}</td>
                  <td style={{ padding: '20px', color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem' }}>{Number(f.price).toLocaleString()}</td>
                  <td style={{ padding: '20px' }}><span style={{ color: f.available_seats > 0 ? '#fff' : '#ff4d4f', background: f.available_seats > 0 ? 'transparent' : 'rgba(255, 77, 79, 0.1)', padding: f.available_seats > 0 ? '0' : '4px 10px', borderRadius: '6px' }}>{f.available_seats > 0 ? f.available_seats : 'เต็ม'}</span></td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <button onClick={() => handleRequestDelete(f.flight_id)} style={{ backgroundColor: 'transparent', color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.5)', padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ff4d4f'; e.currentTarget.style.color = 'white'; e.currentTarget.style.border = '1px solid #ff4d4f'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff4d4f'; e.currentTarget.style.border = '1px solid rgba(255, 77, 79, 0.5)'; }}>
                      <span>🗑️</span> ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔥 [NEW] PREMIUM SUCCESS MODAL (เพิ่มเที่ยวบินสำเร็จ) 🔥 */}
      {/* ========================================================================= */}
      {showSuccessModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            animation: 'fadeIn 0.4s ease-out'
        }} onClick={() => setShowSuccessModal(false)}>
            <div style={{
                background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)', 
                borderRadius: '30px', padding: '50px',
                maxWidth: '500px', width: '90%',
                border: '2px solid rgba(40, 167, 69, 0.5)', // ขอบเขียวเรืองแสง
                boxShadow: '0 0 50px rgba(40, 167, 69, 0.3)',
                textAlign: 'center', position: 'relative',
                animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
            }} onClick={(e) => e.stopPropagation()}>
            
                {/* Icon ติ๊กถูกเด้งดึ๋ง */}
                <div style={{ 
                    width: '100px', height: '100px', margin: '0 auto 30px',
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.5rem', boxShadow: '0 0 30px rgba(40, 167, 69, 0.6)',
                    animation: 'bounce 1s ease-in-out infinite'
                }}>✓</div>

                <h2 style={{ fontFamily: 'Chonburi', color: '#fff', margin: '0 0 15px', fontSize: '2.2rem', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    เพิ่มเที่ยวบินสำเร็จ!
                </h2>
                
                <p style={{ fontFamily: 'Prompt', color: '#ccc', marginBottom: '40px', fontSize: '1.2rem' }}>
                    ข้อมูลเที่ยวบินถูกบันทึกเข้าสู่ระบบแล้ว <br/>
                    พร้อมให้บริการทันที ✈️
                </p>

                <button onClick={() => setShowSuccessModal(false)} style={{
                    padding: '15px 40px', borderRadius: '50px', border: 'none',
                    background: 'linear-gradient(90deg, #28a745, #20c997)', 
                    color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(40, 167, 69, 0.4)', transition: '0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ตกลง (OK)
                </button>
            </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔥 DELETE CONFIRMATION MODAL (สำหรับ Admin - Logic เดิม) 🔥 */}
      {/* ========================================================================= */}
      {showDeleteModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setShowDeleteModal(false)}>
            <div style={{
                background: 'linear-gradient(145deg, #2b0808, #3b1010)',
                borderRadius: '24px', padding: '40px',
                maxWidth: '450px', width: '90%',
                border: '1px solid rgba(255, 77, 79, 0.3)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
                textAlign: 'center',
                animation: 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(255, 77, 79, 0.5))', animation: 'shake 0.5s ease-in-out' }}>🗑️</div>
            <h2 style={{ fontFamily: 'Chonburi', color: '#ffcccb', margin: '0 0 15px', fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>ลบเที่ยวบินถาวร?</h2>
            <p style={{ fontFamily: 'Prompt', color: '#aaa', marginBottom: '35px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                คุณกำลังจะลบเที่ยวบินนี้ออกจากระบบ <br/> <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>การกระทำนี้ไม่สามารถเรียกคืนได้!</span>
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={() => setShowDeleteModal(false)} style={{ padding: '14px 28px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontFamily: 'Prompt', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>ยกเลิก</button>
                <button onClick={handleConfirmDelete} style={{ padding: '14px 35px', borderRadius: '50px', border: 'none', background: 'linear-gradient(90deg, #d32f2f, #ff7875)', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.2s', boxShadow: '0 5px 20px rgba(211, 47, 47, 0.4)' }}>ยืนยันการลบ</button>
            </div>
            </div>
        </div>
      )}

      {/* Shared Styles */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounceIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%,100%{transform:rotate(0deg)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)} }
        @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </>
  );
};