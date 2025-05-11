import React, { useState } from 'react';

const services = ['کوتاهی مو', 'رنگ مو', 'تتو'];
const staff = ['نسین تواتبایی', 'زهره تواتبایی', 'شهایق تواتبایی'];

function BookingPage() {
  const [service, setService] = useState('');
  const [staffMember, setStaffMember] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    const bookingData = { service, staffMember, date, time };
    console.log('Booking Data:', bookingData);
    alert('نوبت شما ثبت شد!');
  };

  return (
    <div>
      <h1>نوبت‌دهی سالن خوشچهره</h1>
      <div>
        <select onChange={e => setService(e.target.value)} value={service}>
          <option value="">انتخاب نوع خدمت</option>
          {services.map((service) => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </div>
      <div>
        <select onChange={e => setStaffMember(e.target.value)} value={staffMember}>
          <option value="">انتخاب فرد</option>
          {staff.map((member) => (
            <option key={member} value={member}>{member}</option>
          ))}
        </select>
      </div>
      <div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      </div>
      <button onClick={handleSubmit}>ثبت نوبت</button>
    </div>
  );
}

export default BookingPage;
