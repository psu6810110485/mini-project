import React, { useState } from 'react';
import api from '../api/axios'; 
// แก้ไข Error 'verbatimModuleSyntax' โดยการใช้ import type
import type { LoginRequest, AuthResponse } from '../types';

export const Login: React.FC<{ onLoginSuccess: (user: any) => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // ใช้ React.FormEvent ตามข้อกำหนด
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginData: LoginRequest = { email, password };
      // เชื่อมต่อ API ตามเกณฑ์ Integration
      const response = await api.post<AuthResponse>('/auth/login', loginData);
      
      // เก็บ JWT Token และข้อมูล User ใน Local Storage ตามโจทย์
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      onLoginSuccess(response.data.user);
      alert('เข้าสู่ระบบสำเร็จ!');
    } catch (error) {
      console.error('Login failed', error);
      alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '40px auto' }}>
      <h2>เข้าสู่ระบบ (Login)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="อีเมล" 
          value={email} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="รหัสผ่าน" 
          value={password} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  );
};