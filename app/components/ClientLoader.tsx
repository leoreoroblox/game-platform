'use client';
import { useState, useEffect } from 'react';

export default function ClientLoader() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 如果已經播過，就不再顯示，避免切換頁面一直閃
    if (sessionStorage.getItem('leo_loader_played') === 'true') {
      return;
    }

    setIsVisible(true);
    sessionStorage.setItem('leo_loader_played', 'true');

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500); // 🚀 1500毫秒 = 1.5秒

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#050810] flex items-center justify-center animate-[fadeOut_1.5s_ease-in-out_forwards] pointer-events-none">
      <img 
        src="/logo.png" 
        alt="Leo Game" 
        className="h-32 object-contain drop-shadow-[0_0_40px_rgba(255,215,0,0.5)] animate-pulse" 
      />
      <style jsx>{`
        @keyframes fadeOut {
          0% { opacity: 1; visibility: visible; }
          80% { opacity: 1; visibility: visible; }
          100% { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}