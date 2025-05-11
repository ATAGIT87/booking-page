import React, { useState } from "react";
import AWS from "aws-sdk";

const services = ["کوتاهی مو", "رنگ مو", "تتو"];
const staff = ["نسین تواتبایی", "زهره تواتبایی", "شهایق تواتبایی"];

const awsConfig = {
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
};

AWS.config.update(awsConfig);

const s3 = new AWS.S3();
const bucketName = "booking-data-khoshchehre";

function BookingPage() {
  const [service, setService] = useState("");
  const [staffMember, setStaffMember] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async () => {
    const bookingData = {
      service,
      staffMember,
      date,
      time,
    };

    const fileName = `booking-${Date.now()}.json`;
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: JSON.stringify(bookingData),
      ContentType: "application/json",
    };

    try {
      await s3.upload(params).promise();
      alert("نوبت شما ثبت شد و در S3 ذخیره شد!");
    } catch (err) {
      console.error("خطا در آپلود به S3:", err);
      alert("مشکلی در ثبت نوبت به وجود آمد.");
    }
  };

  return (
    <div>
      <h1>نوبت‌دهی سالن خوشچهره</h1>
      <div>
        <select onChange={(e) => setService(e.target.value)} value={service}>
          <option value="">انتخاب نوع خدمت</option>
          {services.map((service) => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </div>
      <div>
        <select onChange={(e) => setStaffMember(e.target.value)} value={staffMember}>
          <option value="">انتخاب فرد</option>
          {staff.map((member) => (
            <option key={member} value={member}>{member}</option>
          ))}
        </select>
      </div>
      <div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <button onClick={handleSubmit}>ثبت نوبت</button>
    </div>
  );
}

export default BookingPage;
