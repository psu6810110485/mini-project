// แม่แบบการ์ดตั๋วเครื่องบินแบบ Premium
const FlightBooking = ({ flight }: { flight: any }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "ระบุวันเดินทาง" : d.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flight-card glass-panel">
      <div className="card-left">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span className="flight-badge">{flight.flight_code}</span>
          <span className="status-live">● LIVE</span>
        </div>
        <div className="route-display">
          <div className="city">
            <h1>{flight.origin}</h1>
            <p>Departure</p>
          </div>
          <div className="plane-icon">✈️</div>
          <div className="city">
            <h1>{flight.destination}</h1>
            <p>Arrival</p>
          </div>
        </div>
        <div className="flight-info-footer">
          <span>📅 {formatDate(flight.travel_date)}</span>
          <span>💺 {flight.available_seats} ที่นั่งเหลือ</span>
        </div>
      </div>
      
      <div className="card-right">
        <p>ราคาเริ่มต้น</p>
        <div className="price-text">฿{Number(flight.price).toLocaleString()}</div>
        <button className="btn-book">จองตอนนี้</button>
      </div>
    </div>
  );
};

export default FlightBooking;