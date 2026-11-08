'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { usePathname } from 'next/navigation';

export default function SiteStatus() {
  const [settings, setSettings] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [maintenanceCountdown, setMaintenanceCountdown] = useState<number | null>(null);
  const [endCountdown, setEndCountdown] = useState<string>('');
  const [localEndTime, setLocalEndTime] = useState<string>('');
  const [is10sWarning, setIs10sWarning] = useState(false);

  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const hasReloaded = useRef(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: siteData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (siteData) {
        setSettings(siteData);
        if (siteData.maintenance_end_time) {
          const d = new Date(siteData.maintenance_end_time);
          // 🚀 修復：強制使用英文格式
          setLocalEndTime(d.toLocaleString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          }));
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        if (userData?.role === 'admin' || userData?.role === 'owner') setIsAdmin(true);
      }
      setLoading(false);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!settings) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();

      if (settings.maintenance_start_time) {
        const startTime = new Date(settings.maintenance_start_time).getTime();
        const diff = Math.floor((startTime - now) / 1000);

        if (diff > 0) {
          setMaintenanceCountdown(diff);
          if (diff <= 10) setIs10sWarning(true);
        } else {
          setMaintenanceCountdown(0);
          setIs10sWarning(false);
          if (!hasReloaded.current && !isAdmin && !isAdminPage) {
            const hasRefreshed = sessionStorage.getItem('maintenance_refreshed');
            if (!hasRefreshed) {
              hasReloaded.current = true;
              sessionStorage.setItem('maintenance_refreshed', 'true');
              window.location.reload();
            }
          }
        }
      } else {
        setMaintenanceCountdown(null);
        setIs10sWarning(false);
      }

      if (settings.maintenance_end_time) {
        const end = new Date(settings.maintenance_end_time).getTime();
        const distance = end - now;
        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setEndCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setEndCountdown('00:00:00');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings, isAdmin, isAdminPage]);

  if (loading || !settings) return null;

  const isMaintenanceActive = settings.maintenance_mode || (maintenanceCountdown !== null && maintenanceCountdown <= 0);
  
  let warningMsg = '';
  if (maintenanceCountdown !== null && maintenanceCountdown > 10) {
    const days = Math.floor(maintenanceCountdown / 86400);
    const hours = Math.floor((maintenanceCountdown % 86400) / 3600);
    const minutes = Math.floor((maintenanceCountdown % 3600) / 60);
    const seconds = maintenanceCountdown % 60;
    
    let timeStr = '';
    if (days > 0) timeStr += `${days}d `;
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

    warningMsg = `⚠️ System will enter maintenance in ${timeStr}. Please save your work!`;
  }

  return (
    <>
      {is10sWarning && maintenanceCountdown !== null && (
        <div className="fixed inset-0 z-[999999] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="text-8xl md:text-9xl font-black text-red-500 animate-bounce drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">
            {maintenanceCountdown}
          </div>
          <p className="text-xl md:text-2xl mt-8 font-bold text-red-200 uppercase tracking-[0.2em]">Entering Maintenance In</p>
        </div>
      )}

      {isMaintenanceActive && !isAdmin && (
        <div className="fixed inset-0 z-[999998] bg-[#050810] flex flex-col items-center justify-center text-white px-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
            <div className="text-7xl mb-6 animate-pulse">🛠️</div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 tracking-wider text-center uppercase">{settings.maintenance_type}</h1>
            <p className="text-lg text-gray-400 text-center leading-relaxed mb-6 whitespace-pre-wrap">{settings.maintenance_message}</p>
            
            {/* 🚀 新增：管理員專屬公告 */}
            {settings.maintenance_notice && (
              <div className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-yellow-400 text-center font-bold text-sm">
                📢 {settings.maintenance_notice}
              </div>
            )}

            {endCountdown && (
              <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(255,0,0,0.1)] w-full">
                <div className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mb-4">Estimated Time Remaining</div>
                <div className={`text-6xl font-mono font-bold tracking-tight drop-shadow-[0_0_15px_rgba(0,255,204,0.5)] ${endCountdown === '00:00:00' ? 'text-red-500' : 'text-cyan-400'}`}>
                  {endCountdown === '00:00:00' ? 'Finalizing...' : endCountdown}
                </div>
                {endCountdown !== '00:00:00' && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 bg-black/40 py-2 px-4 rounded-full border border-gray-800 inline-block mx-auto">
                    Expected completion: <strong className="text-white">{localEndTime}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 w-full z-[60] flex flex-col pointer-events-none">
        {warningMsg && !isMaintenanceActive && !isAdminPage && (
          <div className="w-full bg-yellow-500 text-black text-sm font-bold py-2 text-center shadow-md animate-pulse pointer-events-auto border-b border-black/20">
            {warningMsg}
          </div>
        )}

        {settings.announcement_text && !isMaintenanceActive && !isAdminPage && !warningMsg && (
          <div 
            className="w-full overflow-hidden pointer-events-auto relative group border-b border-black/20"
            style={{ backgroundColor: settings.announcement_bg_color || '#06b6d4' }}
          >
            <div 
              className={`whitespace-nowrap inline-block pl-[100vw] ${settings.announcement_font_size || 'text-sm'} font-bold py-2`}
              style={{
                color: settings.announcement_text_color || '#ffffff',
                animation: `${settings.announcement_direction === 'right' ? 'marquee-right' : 'marquee-left'} ${settings.announcement_speed || 20}s linear infinite`,
              }}
            >
              {settings.announcement_text}
            </div>
            <style jsx>{`
              .group:hover div {
                animation-play-state: ${settings.announcement_pause_hover ? 'paused' : 'running'} !important;
              }
            `}</style>
          </div>
        )}
      </div>
    </>
  );
}