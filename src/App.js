import React, { useState, useEffect } from "react";
import AWS from "aws-sdk";
import * as XLSX from "xlsx";

const services = ["کوتاهی مو", "رنگ مو", "تتو"];
const staff = ["نسین تواتبایی", "زهره تواتبایی", "شهایق تواتبایی"];

const awsConfig = {
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
  s3BucketName: process.env.REACT_APP_S3_BUCKET_NAME,
};

AWS.config.update(awsConfig);

const s3 = new AWS.S3();
const bucketName = "booking-data-khoshchehre";
const excelFileName = "booking-data.xlsx";

function BookingPage() {
  const [service, setService] = useState("");
  const [staffMember, setStaffMember] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    fetchBookedSlots();
  }, []);

  const fetchBookedSlots = async () => {
    try {
      const response = await s3
        .getObject({ Bucket: bucketName, Key: excelFileName })
        .promise();
      const fileData = new Uint8Array(response.Body);
      const workbook = XLSX.read(fileData, { type: "array" });
      const sheet = workbook.Sheets["Booking Data"];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const slots = jsonData.slice(1).map((row) => ({
        date: row[2],
        time: row[3],
      }));

      setBookedSlots(slots);
    } catch (err) {
      console.log("فایل Excel یافت نشد یا خالی است.");
    }
  };

  const isSlotBooked = (date, time) => {
    return bookedSlots.some((slot) => slot.date === date && slot.time === time);
  };

  const handleSubmit = async () => {
    const bookingData = { service, staffMember, date, time };

    try {
      await createOrUpdateExcel(bookingData);
      alert("نوبت شما ثبت شد!");
      fetchBookedSlots();
    } catch (err) {
      console.error("خطا در ثبت نوبت:", err);
      alert("مشکلی در ثبت نوبت به وجود آمد.");
    }
  };

  const createOrUpdateExcel = async (data) => {
    try {
      let fileData;

      try {
        const response = await s3
          .getObject({ Bucket: bucketName, Key: excelFileName })
          .promise();
        fileData = response.Body;
      } catch (err) {
        console.log("فایل Excel یافت نشد. فایل جدید ایجاد می‌شود.");
      }

      let workbook;
      if (fileData) {
        const fileBuffer = new Uint8Array(fileData);
        workbook = XLSX.read(fileBuffer, { type: "array" });
      } else {
        workbook = XLSX.utils.book_new();
      }

      const sheetName = "Booking Data";
      let worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        const headers = [["Service", "Staff", "Date", "Time"]];
        worksheet = XLSX.utils.aoa_to_sheet(headers);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      const newRow = [data.service, data.staffMember, data.date, data.time];
      XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const uploadParams = {
        Bucket: bucketName,
        Key: excelFileName,
        Body: blob,
        ContentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      await s3.upload(uploadParams).promise();
      console.log("فایل Excel به‌روزرسانی شد.");
    } catch (err) {
      console.error("خطا در ایجاد یا آپدیت فایل Excel:", err);
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    if (isSlotBooked(date, selectedTime)) {
      alert("این زمان قبلاً رزرو شده است.");
    } else {
      setTime(selectedTime);
    }
  };

  return (
    <div>
      <h1>نوبت‌دهی سالن خوشچهره</h1>
      <select onChange={(e) => setService(e.target.value)} value={service}>
        <option value="">انتخاب نوع خدمت</option>
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>
      <select onChange={(e) => setStaffMember(e.target.value)} value={staffMember}>
        <option value="">انتخاب فرد</option>
        {staff.map((member) => (
          <option key={member} value={member}>
            {member}
          </option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input
        type="time"
        value={time}
        onChange={handleTimeChange}
        disabled={!date}
      />
      <button onClick={handleSubmit}>ثبت نوبت</button>
    </div>
  );
}

export default BookingPage;
