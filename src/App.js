import React, { useState } from "react";
import AWS from "aws-sdk";
import * as XLSX from "xlsx";


const services = ["کوتاهی مو", "رنگ مو", "تتو"];
const staff = ["نسین تواتبایی", "زهره تواتبایی", "شهایق تواتبایی"];

const awsConfig = {
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
   s3BucketName : process.env.REACT_APP_S3_BUCKET_NAME
};

AWS.config.update(awsConfig);

const s3 = new AWS.S3();
const bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
const excelFileName = "booking-data.xlsx";

function BookingPage() {
  const [service, setService] = useState("");
  const [staffMember, setStaffMember] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const createOrUpdateExcel = async (data) => {
    try {
      // دانلود فایل Excel از S3
      let fileData;
      try {
        const response = await s3
          .getObject({ Bucket: bucketName, Key: excelFileName })
          .promise();
        fileData = response.Body;
      } catch (err) {
        console.log("فایل Excel یافت نشد. فایل جدید ایجاد می‌شود.");
      }

      // ایجاد ورک بوک
      let workbook;
      if (fileData) {
        const fileBuffer = new Uint8Array(fileData);
        workbook = XLSX.read(fileBuffer, { type: "array" });
      } else {
        workbook = XLSX.utils.book_new();
      }

      // اضافه کردن داده جدید
      const sheetName = "Booking Data";
      const worksheet = workbook.Sheets[sheetName] || XLSX.utils.aoa_to_sheet([["Service", "Staff", "Date", "Time"]]);
      const newRow = [data.service, data.staffMember, data.date, data.time];
      XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });
      workbook.Sheets[sheetName] = worksheet;

      // تبدیل به باینری
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // آپلود فایل به S3
      const uploadParams = {
        Bucket: bucketName,
        Key: excelFileName,
        Body: Buffer.from(excelBuffer),
        ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      await s3.upload(uploadParams).promise();
      console.log("فایل Excel به‌روزرسانی شد.");
    } catch (err) {
      console.error("خطا در ایجاد یا آپدیت فایل Excel:", err);
    }
  };

  const handleSubmit = async () => {
    const bookingData = {
      service,
      staffMember,
      date,
      time,
    };

    try {
      await createOrUpdateExcel(bookingData);
      alert("نوبت شما ثبت شد و در S3 ذخیره شد!");
    } catch (err) {
      console.error("خطا در ثبت نوبت:", err);
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