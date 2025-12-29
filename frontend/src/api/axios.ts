import axios from 'axios';

// สร้าง instance ของ axios เพื่อกำหนดค่าพื้นฐาน
const api = axios.create({
  baseURL: 'http://localhost:3000', // URL ของ NestJS Backend ของคุณ
  headers: {
    'Content-Type': 'application/json',
  },
});

// ระบบ Interceptor: แนบ Token ไปกับ Header อัตโนมัติทุกครั้งที่ยิง API
// ตรงตามข้อกำหนด "การเก็บ Token ปลอดภัย" และ "Authentication Flow" 
api.interceptors.request.use(
  (config) => {
    // ดึง token จาก Local Storage ตามที่โจทย์ระบุ 
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;