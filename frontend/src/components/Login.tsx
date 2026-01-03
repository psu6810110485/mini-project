import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../types';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  // State UI
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // ✅ State สำหรับโชว์ Popup ความสำเร็จ
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userNameForWelcome, setUserNameForWelcome] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        // 🔥 Login Logic
        const loginData: LoginRequest = { email, password };
        const response = await api.post<any>('/auth/login', loginData);
        
        const token = response.data.access_token;
        const userData = response.data.user;

        if (token && userData) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          if (rememberMe) {
            localStorage.setItem('remembered_email', email);
          } else {
            localStorage.removeItem('remembered_email');
          }

          // ✅ เปลี่ยนจาก alert ธรรมดา เป็นโชว์ Modal สวยๆ
          setUserNameForWelcome(userData.name || 'User');
          setShowSuccessModal(true);

          // รอ 1.5 วินาที ให้คนอ่านข้อความก่อน แล้วค่อยพาไปหน้าต่อไป
          setTimeout(() => {
            onLoginSuccess(userData);
            navigate('/flights'); 
          }, 1500);

        } else {
          alert('เกิดข้อผิดพลาด: ข้อมูลจาก Server ไม่สมบูรณ์');
        }

      } else {
        // 🔥 Register Logic
        const registerData = { name, email, password, role: 'USER' };
        await api.post('/auth/register', registerData);
        
        // แจ้งเตือนสมัครสำเร็จ (ใช้ alert เดิมก็ได้ หรือจะทำ Modal ก็ได้ แต่นี่ใช้ alert เพื่อความเร็ว)
        alert('✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setIsLoginMode(true); 
        setPassword('');
      }
    } catch (error: any) {
      console.error('Action failed', error);
      const msg = error.response?.data?.message;
      alert(`ทำรายการไม่สำเร็จ: ${Array.isArray(msg) ? msg.join(', ') : msg || 'โปรดตรวจสอบข้อมูล'}`);
    }
  };

  return (
    <>
      {/* --------------------------------------------------- */}
      {/* ✅ ส่วนที่ 1: Modal แจ้งเตือนความสำเร็จ (Overlay) */}
      {/* --------------------------------------------------- */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // พื้นหลังมืด
          zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)' // เบลอฉากหลัง
        }}>
          <div className="glass-panel" style={{
            backgroundColor: '#fff', padding: '40px', borderRadius: '20px',
            textAlign: 'center', maxWidth: '320px', width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            {/* ไอคอนติ๊กถูก SVG สีเขียว */}
            <div style={{ marginBottom: '20px' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            
            <h2 style={{ 
              margin: '0 0 10px 0', 
              fontFamily: 'Chonburi', 
              color: '#333',
              fontSize: '24px'
            }}>
              เข้าสู่ระบบสำเร็จ!
            </h2>
            <p style={{ 
              fontFamily: 'Prompt', 
              color: '#666', 
              margin: 0,
              fontSize: '16px'
            }}>
              ยินดีต้อนรับคุณ <br/>
              <strong style={{ color: 'var(--rich-gold)', fontSize: '18px' }}>{userNameForWelcome}</strong>
            </p>
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#999', fontFamily: 'Prompt' }}>
              กำลังพาท่านไปที่หน้าหลัก...
            </p>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* ส่วนที่ 2: ฟอร์ม Login เดิม (คงสภาพปุ่มตาไว้) */}
      {/* --------------------------------------------------- */}
      <div className="glass-panel" style={{ padding: '40px', maxWidth: '450px', margin: '40px auto', borderRadius: '20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--rich-gold)', fontFamily: 'Chonburi' }}>
          {isLoginMode ? 'เข้าสู่ระบบ (Login)' : 'สร้างบัญชีใหม่ (Register)'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', textAlign: 'left' }}>
          
          {!isLoginMode && (
            <div>
              <label style={{ fontSize: '14px', fontFamily: 'Prompt', color: '#fff' }}>ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                placeholder="กรอกชื่อของคุณ" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required={!isLoginMode} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '14px', fontFamily: 'Prompt', color: '#fff' }}>อีเมล</label>
            <input 
              type="email" 
              placeholder="user@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '14px', fontFamily: 'Prompt', color: '#fff' }}>รหัสผ่าน</label>
            <div style={{ position: 'relative', marginTop: '5px' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="กรอกรหัสผ่าน" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  paddingRight: '50px', 
                  borderRadius: '8px', 
                  border: '1px solid #ccc', 
                  boxSizing: 'border-box' 
                }}
              />
              
              {/* ปุ่มลูกตา (ใช้ span เพื่อไม่ให้เพี้ยน) */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  zIndex: 10,
                }}
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? (
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </span>
            </div>
          </div>

          {isLoginMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontFamily: 'Prompt', color: '#fff' }}>
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--rich-gold)' }}
              />
              <label htmlFor="rememberMe" style={{ cursor: 'pointer', userSelect: 'none' }}>จดจำฉันไว้ในเครื่องนี้</label>
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              padding: '14px', 
              borderRadius: '50px', 
              border: 'none', 
              background: 'linear-gradient(90deg, #D4AF37 0%, #C5A028 100%)', 
              color: '#000', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              fontFamily: 'Prompt', 
              cursor: 'pointer', 
              marginTop: '10px',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
            }}
          >
            {isLoginMode ? 'เข้าสู่ระบบ' : 'ยืนยันการสมัคร'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', fontFamily: 'Prompt', color: '#fff' }}>
          {isLoginMode ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้ว? "}
          <span 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setPassword('');
            }}
            style={{ color: '#87CEFA', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', marginLeft: '5px' }}
          >
            {isLoginMode ? 'สมัครสมาชิกเลย' : 'กลับไปเข้าสู่ระบบ'}
          </span>
        </div>
      </div>
    </>
  );
};