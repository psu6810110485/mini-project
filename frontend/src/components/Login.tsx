import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '../types';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // State เดิม (ห้ามลบ)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State สำหรับ Popup
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
        // --- Login Logic ---
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

          setUserNameForWelcome(userData.name || 'User');
          setShowSuccessModal(true);

          setTimeout(() => {
            onLoginSuccess(userData);
            navigate('/flights'); 
          }, 1500);
        } else {
          throw new Error('ข้อมูลจาก Server ไม่สมบูรณ์');
        }

      } else {
        // --- Register Logic ---
        const registerData = { name, email, password, role: 'USER' };
        await api.post('/auth/register', registerData);
        
        alert('✅ สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setIsLoginMode(true); 
        setPassword('');
      }

    } catch (error: any) {
      console.error('Action failed', error);
      
      const msg = error.response?.data?.message;
      let displayMsg = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';

      if (error.response?.status === 401) {
        displayMsg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (Array.isArray(msg)) {
        displayMsg = msg.join(', ');
      } else if (typeof msg === 'string') {
        displayMsg = msg;
      }

      setErrorMessage(displayMsg);
      setShowErrorModal(true);
    }
  };

  return (
    <>
      {/* --------------------------------------------------- */}
      {/* ✅ Modal 1: แจ้งเตือนความสำเร็จ (สีเขียว) */}
      {/* --------------------------------------------------- */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel" style={{
            backgroundColor: '#fff', padding: '40px', borderRadius: '25px',
            textAlign: 'center', maxWidth: '320px', width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 10px 0', fontFamily: 'Chonburi', color: '#333', fontSize: '24px' }}>
              เข้าสู่ระบบสำเร็จ!
            </h2>
            <p style={{ fontFamily: 'Prompt', color: '#666', margin: 0, fontSize: '16px' }}>
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
      {/* ✅ Modal 2: แจ้งเตือนข้อผิดพลาด (สีแดง) */}
      {/* --------------------------------------------------- */}
      {showErrorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-panel" style={{
            backgroundColor: '#fff', padding: '30px', borderRadius: '25px',
            textAlign: 'center', maxWidth: '350px', width: '90%',
            border: '2px solid #ff4d4f',
            boxShadow: '0 10px 30px rgba(255, 77, 79, 0.2), 0 20px 50px rgba(0,0,0,0.2)',
            animation: 'shake 0.4s ease-in-out'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 10px 0', fontFamily: 'Chonburi', color: '#ff4d4f', fontSize: '22px' }}>
              เข้าสู่ระบบไม่สำเร็จ
            </h2>
            <p style={{ fontFamily: 'Prompt', color: '#555', margin: '0 0 20px 0', fontSize: '16px', lineHeight: '1.5' }}>
              {errorMessage}
            </p>
            <button 
              onClick={() => setShowErrorModal(false)}
              style={{
                background: 'linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%)',
                color: 'white', border: 'none',
                padding: '12px 30px', borderRadius: '50px',
                fontFamily: 'Prompt', fontWeight: 'bold', fontSize: '16px',
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 77, 79, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* 🚀 ส่วนฟอร์ม Login (Premium Design) */}
      {/* --------------------------------------------------- */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '45px 40px', 
          maxWidth: '480px', 
          margin: '40px auto', 
          borderRadius: '24px', 
          textAlign: 'center',
          backgroundColor: 'rgba(13, 37, 63, 0.92)', 
          border: '2px solid rgba(197, 160, 89, 0.7)', 
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
          backdropFilter: 'blur(15px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* ✈️ Decorative Plane Icon Background */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          opacity: '0.08',
          pointerEvents: 'none',
          transform: 'rotate(-15deg)'
        }}>
          <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#D4AF37' }}>
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>

        {/* 🎫 Ticket Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 25px',
          background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(212, 175, 55, 0.4)',
          position: 'relative'
        }}>
          <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#0D253F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '20px',
            background: 'rgba(212, 175, 55, 0.3)',
            filter: 'blur(10px)',
            borderRadius: '50%'
          }}></div>
        </div>

        <h2 style={{ 
          marginBottom: '12px', 
          color: '#D4AF37', 
          fontFamily: 'Chonburi', 
          textShadow: '0 2px 8px rgba(212, 175, 55, 0.6)',
          fontSize: '26px',
          letterSpacing: '0.5px'
        }}>
          {isLoginMode ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
        </h2>
        
        {/* ✈️ Subtitle */}
        <p style={{
          margin: '0 0 30px 0',
          fontFamily: 'Prompt',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '1px'
        }}>
          {isLoginMode ? '🌏 ระบบจองตั๋วเครื่องบิน' : '🎫 เริ่มต้นการเดินทางของคุณ'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', textAlign: 'left' }}>
          
          {!isLoginMode && (
            <div>
              <label style={{ 
                fontSize: '13px', 
                fontFamily: 'Prompt', 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontWeight: 600,
                display: 'block',
                marginBottom: '8px',
                textAlign: 'left'
              }}>
                👤 ชื่อ-นามสกุล
              </label>
              <input 
                type="text" 
                placeholder="ระบุชื่อของคุณ" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required={!isLoginMode} 
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '12px', 
                  border: '1.5px solid rgba(255,255,255,0.2)', 
                  boxSizing: 'border-box', 
                  background: 'rgba(255,255,255,0.08)', 
                  color: '#fff',
                  fontSize: '15px',
                  fontFamily: 'Prompt',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.target.style.background = 'rgba(255,255,255,0.12)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div>
            <label style={{ 
              fontSize: '13px', 
              fontFamily: 'Prompt', 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontWeight: 600,
              display: 'block',
              marginBottom: '8px',
              textAlign: 'left'
            }}>
              ✉️ อีเมล
            </label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                borderRadius: '12px', 
                border: '1.5px solid rgba(255,255,255,0.2)', 
                boxSizing: 'border-box', 
                background: 'rgba(255,255,255,0.08)', 
                color: '#fff',
                fontSize: '15px',
                fontFamily: 'Prompt',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                e.target.style.background = 'rgba(255,255,255,0.12)';
                e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                e.target.style.background = 'rgba(255,255,255,0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ 
              fontSize: '13px', 
              fontFamily: 'Prompt', 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontWeight: 600,
              display: 'block',
              marginBottom: '8px',
              textAlign: 'left'
            }}>
              🔒 รหัสผ่าน
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="กรอกรหัสผ่าน" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: '14px 50px 14px 16px', 
                  borderRadius: '12px', 
                  border: '1.5px solid rgba(255,255,255,0.2)', 
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.08)', 
                  color: '#fff',
                  fontSize: '15px',
                  fontFamily: 'Prompt',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.target.style.background = 'rgba(255,255,255,0.12)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', 
                  right: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'rgba(212, 175, 55, 0.8)', 
                  zIndex: 10,
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#D4AF37'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(212, 175, 55, 0.8)'}
              >
                {showPassword ? (
                   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </span>
            </div>
          </div>

          {isLoginMode && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              fontSize: '13px', 
              fontFamily: 'Prompt', 
              color: 'rgba(255, 255, 255, 0.85)',
              padding: '4px 0'
            }}>
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  cursor: 'pointer', 
                  accentColor: '#D4AF37' 
                }}
              />
              <label htmlFor="rememberMe" style={{ 
                cursor: 'pointer', 
                userSelect: 'none',
                fontWeight: 500
              }}>
                จดจำฉันไว้ในเครื่องนี้
              </label>
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              padding: '16px 24px', 
              borderRadius: '50px', 
              border: 'none', 
              background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)', 
              color: '#0D253F', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              fontFamily: 'Prompt', 
              cursor: 'pointer', 
              marginTop: '10px',
              boxShadow: '0 6px 20px rgba(212, 175, 55, 0.45), 0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.6), 0 4px 12px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.45), 0 2px 8px rgba(0,0,0,0.2)';
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isLoginMode ? '✈️ เข้าสู่ระบบ' : '🎫 ยืนยันการสมัคร'}
            </span>
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px', 
          fontSize: '14px', 
          fontFamily: 'Prompt', 
          color: 'rgba(255, 255, 255, 0.75)',
          paddingTop: '25px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {isLoginMode ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้ว? "}
          <span 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setPassword('');
            }}
            style={{ 
              color: '#87CEFA', 
              cursor: 'pointer', 
              textDecoration: 'none', 
              fontWeight: 'bold', 
              marginLeft: '5px',
              borderBottom: '2px solid transparent',
              transition: 'all 0.2s',
              paddingBottom: '2px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#4FC3F7';
              e.currentTarget.style.borderBottomColor = '#4FC3F7';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#87CEFA';
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            {isLoginMode ? 'สมัครสมาชิกเลย →' : '← กลับไปเข้าสู่ระบบ'}
          </span>
        </div>
      </div>
    </>
  );
};