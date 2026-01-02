import React, { useState } from 'react';
import type { Flight, ID } from '../types';

interface AdminFlightManagerProps {
  flights: Flight[];
  onAddFlight: (flight: Flight) => Promise<void> | void;
  onDeleteFlight: (id: ID) => void | Promise<void>;
}

export const AdminFlightManager: React.FC<AdminFlightManagerProps> = ({ flights, onAddFlight, onDeleteFlight }) => {
  // ✅ 1. State ใช้ snake_case เพื่อให้ตรงกับ Database
  const [newFlight, setNewFlight] = useState<Partial<Flight>>({
    flight_code: '',
    origin: '',
    destination: '',
    travel_date: '',
    price: 0,
    available_seats: 0,
    status: 'Active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ 2. สร้าง Object ใหม่แบบ snake_case
    const flightToAdd: Flight = {
      flight_id: Date.now(), // Mock ID (ของจริง Backend จะสร้างให้)
      flight_code: newFlight.flight_code || 'TG999',
      origin: newFlight.origin || 'BKK',
      destination: newFlight.destination || 'CNX',
      // ถ้าไม่ได้เลือกวัน ให้ใช้วันปัจจุบัน
      travel_date: newFlight.travel_date || new Date().toISOString(),
      price: Number(newFlight.price) || 0,
      available_seats: Number(newFlight.available_seats) || 0,
      status: 'Active'
    };

    try {
      await onAddFlight(flightToAdd);

      // รีเซ็ตฟอร์ม
      setNewFlight({
        flight_code: '',
        origin: '',
        destination: '',
        travel_date: '',
        price: 0,
        available_seats: 0,
        status: 'Active'
      });
      alert('✅ เพิ่มเที่ยวบินเรียบร้อย!');
    } catch (error) {
      console.error('Create flight failed', error);
      alert('เพิ่มเที่ยวบินไม่สำเร็จ (ตรวจสอบว่า Login เป็น ADMIN และ Backend ทำงานอยู่)');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', textAlign: 'left' }}>
      <h2 style={{ fontFamily: 'Chonburi', color: 'var(--rich-gold)', marginTop: 0 }}>
        🛠️ จัดการเที่ยวบิน (Admin)
      </h2>

      {/* --- ฟอร์มเพิ่มเที่ยวบิน (Premium Style) --- */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        
        {/* Flight Code */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontFamily: 'Prompt', color: '#ddd' }}>รหัสเที่ยวบิน</label>
          <input 
            type="text" 
            placeholder="เช่น TG101" 
            value={newFlight.flight_code}
            onChange={e => setNewFlight({...newFlight, flight_code: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }}
          />
        </div>
        
        {/* Origin */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontFamily: 'Prompt', color: '#ddd' }}>ต้นทาง</label>
          <select 
            value={newFlight.origin}
            onChange={e => setNewFlight({...newFlight, origin: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }}
          >
            <option value="">เลือกต้นทาง</option>
            <option value="BKK">Suvarnabhumi (BKK)</option>
            <option value="DMK">Don Mueang (DMK)</option>
            <option value="CNX">Chiang Mai (CNX)</option>
            <option value="HKT">Phuket (HKT)</option>
            <option value="HDY">Hatyai (HDY)</option>
          </select>
        </div>

        {/* Destination */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontFamily: 'Prompt', color: '#ddd' }}>ปลายทาง</label>
          <select 
            value={newFlight.destination}
            onChange={e => setNewFlight({...newFlight, destination: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }}
          >
            <option value="">เลือกปลายทาง</option>
            <option value="BKK">Suvarnabhumi (BKK)</option>
            <option value="DMK">Don Mueang (DMK)</option>
            <option value="CNX">Chiang Mai (CNX)</option>
            <option value="HKT">Phuket (HKT)</option>
            <option value="HDY">Hatyai (HDY)</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontFamily: 'Prompt', color: '#ddd' }}>วันเวลาเดินทาง</label>
          <input 
            type="datetime-local" 
            value={newFlight.travel_date}
            onChange={e => setNewFlight({...newFlight, travel_date: e.target.value})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }}
          />
        </div>

        {/* Price */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontFamily: 'Prompt', color: '#ddd' }}>ราคา (บาท)</label>
          <input 
            type="number" 
            placeholder="0.00" 
            value={newFlight.price || ''}
            onChange={e => setNewFlight({...newFlight, price: Number(e.target.value)})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }}
          />
        </div>

        {/* Available Seats */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontFamily: 'Prompt', color: '#ddd' }}>ที่นั่งว่าง</label>
          <input 
            type="number" 
            placeholder="จำนวนที่นั่ง" 
            value={newFlight.available_seats || ''}
            onChange={e => setNewFlight({...newFlight, available_seats: Number(e.target.value)})}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none' }}
          />
        </div>

        {/* Submit Button */}
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            + เพิ่มเที่ยวบินใหม่
          </button>
        </div>
      </form>

      {/* --- ตารางแสดงข้อมูล (Update to snake_case) --- */}
      <h3 style={{ fontFamily: 'Chonburi', color: 'white' }}>รายการเที่ยวบิน ({flights.length})</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontFamily: 'Prompt' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--rich-gold)', textAlign: 'left', color: 'var(--rich-gold)' }}>
              <th style={{ padding: '10px' }}>Code</th>
              <th style={{ padding: '10px' }}>Route</th>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Price</th>
              <th style={{ padding: '10px' }}>Seats</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(f => (
              <tr key={f.flight_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {/* ✅ เรียกใช้ snake_case ให้ถูกต้อง */}
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{f.flight_code}</td>
                <td style={{ padding: '10px' }}>{f.origin} ➔ {f.destination}</td>
                <td style={{ padding: '10px' }}>
                  {new Date(f.travel_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute:'2-digit' })}
                </td>
                <td style={{ padding: '10px', color: '#52c41a' }}>{Number(f.price).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>{f.available_seats}</td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => onDeleteFlight(f.flight_id)}
                    style={{ 
                      backgroundColor: '#ff4d4f', color: 'white', border: 'none', 
                      padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};