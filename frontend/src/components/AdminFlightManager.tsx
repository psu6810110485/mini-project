import React, { useState } from 'react';
import type { Flight, ID } from '../types'; // [cite: 30]

interface AdminFlightManagerProps {
  flights: Flight[];
  onAddFlight: (newFlight: Flight) => void;
  onDeleteFlight: (id: ID) => void;
}

export const AdminFlightManager: React.FC<AdminFlightManagerProps> = ({ flights, onAddFlight, onDeleteFlight }) => {
  // State สำหรับฟอร์มเพิ่มข้อมูล (Strict Typing) [cite: 31]
  const [newFlight, setNewFlight] = useState<Partial<Flight>>({
    flightCode: '',
    origin: '',
    destination: '',
    price: 0,
    availableSeats: 0,
  });

  // ใช้ React.FormEvent ตามข้อกำหนดหน้า 2 [cite: 33]
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const flightToAdd: Flight = {
      ...newFlight as Flight,
      flightId: Math.floor(Math.random() * 1000), // Mock ID สำหรับทดสอบ
      travelDate: new Date().toISOString(),
      status: 'Active',
    };
    onAddFlight(flightToAdd);
    // ล้างค่าในฟอร์ม
    setNewFlight({ flightCode: '', origin: '', destination: '', price: 0, availableSeats: 0 });
  };

  return (
    <div style={{ padding: '16px', border: '2px solid #007bff', borderRadius: '8px', textAlign: 'left', backgroundColor: '#f8f9fa', marginBottom: '16px' }}>
      <h3 style={{ color: '#007bff', marginTop: 0 }}>🛠️ Admin Flight Management (CRUD)</h3>
      
      {/* ส่วนเพิ่มข้อมูล  */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input placeholder="Flight Code" value={newFlight.flightCode} onChange={e => setNewFlight({...newFlight, flightCode: e.target.value})} required />
          <input placeholder="Origin" value={newFlight.origin} onChange={e => setNewFlight({...newFlight, origin: e.target.value})} required />
          <input placeholder="Destination" value={newFlight.destination} onChange={e => setNewFlight({...newFlight, destination: e.target.value})} required />
          <input type="number" placeholder="Price" value={newFlight.price || ''} onChange={e => setNewFlight({...newFlight, price: Number(e.target.value)})} required />
          <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>+ เพิ่ม</button>
        </div>
      </form>

      {/* รายการสำหรับลบข้อมูล  */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th>Code</th>
            <th>Route</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flights.map(f => (
            <tr key={f.flightId} style={{ borderBottom: '1px solid #eee' }}>
              <td>{f.flightCode}</td>
              <td>{f.origin} ➔ {f.destination}</td>
              <td>{f.price.toLocaleString()}</td>
              <td>
                <button onClick={() => onDeleteFlight(f.flightId)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};