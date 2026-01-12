import axios from 'axios';

// สร้าง instance ของ axios เพื่อกำหนดค่าพื้นฐาน
const api = axios.create({ // เป็นการสร้าง Instance (ตัวเแทน) ของ Axiosสร้างตัวแปร api นี้ขึ้นมาหนึ่งตัวที่ ตั้งค่าเริ่มต้น (Config) ไว้ให้เสร็จสรรพเลยครับ เอาไปเรียกใช้ที่ไหนก็สะดวก 
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // ✅ เพิ่ม timeout
});

// ✅ Request Interceptor: แนบ Token อัตโนมัติ
api.interceptors.request.use( // ยามเฝ้าประตู (Interceptor) ที่จะคอยตรวจสอบและแก้ไขคำขอก่อนที่จะถูกส่งออกไป
  (config) => {
    const token = localStorage.getItem('token'); // ดึง token จาก localStorage 
    
    if (token && config.headers) { // ถ้ามี token และ headers 
      config.headers.Authorization = `Bearer ${token}`; // แนบ token ไปกับ header เสมอ
      console.log('🔐 Sending request with token:', token.substring(0, 20) + '...'); //ตัดมาแค่20ตัว
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

// ✅ Response Interceptor: จัดการ Error Response Interceptor มีหน้าที่คอยดักจับ Error ที่ตอบกลับมาจาก Server
api.interceptors.response.use(
  (response) => {
    return response; // ถ้าตอบกลับปกติ ก็ส่งต่อไป
  },
  (error) => { // ถ้าตอบกลับเป็น Error จะเข้ามาที่นี่
    if (error.response?.status === 401) {
      console.error('🚫 Unauthorized! Token อาจหมดอายุหรือไม่ถูกต้อง');
      
      // ✅ ลบ token และ redirect ไป login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // ถ้าไม่ได้อยู่ที่หน้า login อยู่แล้ว ให้ redirect
      if (window.location.pathname !== '/') { //User อยู่หน้า Login อยู่แล้ว แล้วเกิด Error 401 ถ้าเราไม่เช็คตรงนี้ ระบบมันจะพยายาม Refresh หน้า Login ซ้ำๆๆๆ จน Browser ค้าง
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;