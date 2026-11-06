'use client';
import { useState, useEffect } from 'react';

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'logo' | 'fadeout' | 'hidden'>(() => {
  // 如果已經播放過，初始狀態直接設為隱藏，避免閃現
  if (typeof window !== 'undefined' && sessionStorage.getItem('leo_loader_played') === 'true') {
    return 'hidden';
  }
  return 'loading';
});

  useEffect(() => {
    // 檢查瀏覽器記憶，如果已經播過，就直接隱藏，不再重複跑
    if (sessionStorage.getItem('leo_loader_played') === 'true') {
      setPhase('hidden');
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase('logo'); 
          
          setTimeout(() => {
            setPhase('fadeout'); 
            // 動畫播完後，在 sessionStorage 做個記號
            sessionStorage.setItem('leo_loader_played', 'true');
            
            setTimeout(() => setPhase('hidden'), 1000); 
          }, 3000); 
          
          return 100;
        }
        return prev + 1;
      });
    }, 15);

    return () => clearInterval(interval);
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#050810] flex flex-col items-center justify-center transition-opacity duration-1000 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 階段一：進度條 */}
      <div className={`absolute flex flex-col items-center transition-all duration-500 ${
        phase === 'loading' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}>
        <div className="text-xl font-mono mb-4 text-cyan-400 tracking-widest uppercase">
          Initializing System
        </div>
        <div className="w-[300px] h-1 bg-gray-800 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(0,255,204,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 text-sm font-mono text-gray-500">
          {progress}%
        </div>
      </div>

      {/* 階段二：Logo */}
      <div className={`absolute flex flex-col items-center justify-center transition-all duration-1000 ${
        phase === 'loading' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <img 
          src="/logo.png" 
          alt="Leo Game" 
          className="h-32 object-contain drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] animate-pulse" 
        />
        <div className="mt-8 text-gray-400 tracking-[0.3em] text-sm uppercase font-light">
          Loading Success!
        </div>
      </div>
    </div>
  );
}