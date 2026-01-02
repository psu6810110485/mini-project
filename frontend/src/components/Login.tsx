import React, { useState } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import type { LoginRequest, User } from '../types';

export const Login: React.FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginData: LoginRequest = { email, password };
      // ยิง API ไปที่ Backend
      const response = await api.post('/auth/login', loginData);
      
      // ดึงข้อมูลตามโครงสร้างที่ Backend ส่งมาจริง
      const token = (response.data as any).access_token as string | undefined;
      const userData = (response.data as any).user as any;

      const normalizedUser: User | null = userData
        ? {
            user_id: userData.user_id ?? userData.userId,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          }
        : null

      // ตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก
      if (token && normalizedUser?.user_id) {
        // บันทึกลง Local Storage เพื่อใช้ยืนยันตัวตนในครั้งถัดไป
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        // อัปเดต State หลักใน App.tsx
        onLoginSuccess(normalizedUser);
        
        alert('เข้าสู่ระบบสำเร็จ!');
        navigate('/flights'); // เปลี่ยนหน้าไปยังรายการเที่ยวบิน
      } else {
        // กรณีข้อมูลมาไม่ครบ (เช่น ขาดก้อน user)
        console.error('Data incomplete from server:', response.data);
        alert('เกิดข้อผิดพลาด: ข้อมูลจาก Server ไม่สมบูรณ์');
      }

    } catch (error) {
      console.error('Login failed', error);
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '40px auto', backgroundColor: '#fff', color: '#000' }}>
      <h2 style={{ textAlign: 'center' }}>เข้าสู่ระบบ (Login)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="อีเมล" 
          value={email} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="รหัสผ่าน" 
          value={password} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
};