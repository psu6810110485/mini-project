import axios from 'axios';

// สร้าง instance ของ axios เพื่อกำหนดค่าพื้นฐาน
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // ✅ เพิ่ม timeout
});

// ✅ Request Interceptor: แนบ Token อัตโนมัติ
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Sending request with token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor: จัดการ Error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 Unauthorized! Token อาจหมดอายุหรือไม่ถูกต้อง');
      
      // ✅ ลบ token และ redirect ไป login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // ถ้าไม่ได้อยู่ที่หน้า login อยู่แล้ว ให้ redirect
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;