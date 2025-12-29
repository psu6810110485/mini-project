import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // เพิ่มตัวจัดการเส้นทาง
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* หุ้ม App ด้วย BrowserRouter เพื่อให้ทั้งแอปสามารถใช้การสลับหน้า (Link, Routes) ได้ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)