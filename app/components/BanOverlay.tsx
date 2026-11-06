'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function BanOverlay() {
  const [banInfo, setBanInfo] = useState<any>(null);

  useEffect(() => {
    const checkBan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. 抓取玩家資料 (多抓一個 role 欄位)
      const { data: user } = await supabase
        .from('users')
        .select('role, banned_until, ban_reason, banned_ip, banned_device_id, device_id')
        .eq('id', session.user.id)
        .single();

      if (!user) return;

      // 🚀 終極防護：如果是管理員，直接解除遮罩，免疫一切封禁！
      if (user.role === 'admin') {
        setBanInfo(null);
        return;
      }

      // 2. 判斷是否被時間封禁
      if (user.banned_until && new Date(user.banned_until) > new Date()) {
        setBanInfo({ reason: user.ban_reason, until: user.banned_until, type: 'account' });
        return;
      }

      // 3. 判斷是否被 IP 封禁
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const ipData = await res.json();
        
        if (user.banned_ip && user.banned_ip === ipData.ip) {
          setBanInfo({ 
            reason: user.ban_reason || 'IP Address Blacklisted (Suspicious Activity)', 
            until: 'Permanent (IP Banned)', 
            type: 'ip' 
          });
          return;
        }
      } catch (e) {
        console.error('無法獲取 IP', e);
      }

      // 4. 判斷是否被設備封禁
      if (user.banned_device_id && user.device_id && user.banned_device_id === user.device_id) {
        setBanInfo({ 
          reason: user.ban_reason || 'Device Blacklisted (Suspicious Activity)', 
          until: 'Permanent (Device Banned)', 
          type: 'device' 
        });
        return;
      }

      setBanInfo(null);
    };

    checkBan();
    const interval = setInterval(checkBan, 10000); // 每10秒檢查一次
    return () => clearInterval(interval);
  }, []);

  if (!banInfo) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center text-white px-6">
      <div className="max-w-2xl w-full bg-gray-900 border border-red-500/50 rounded-3xl p-10 shadow-[0_0_50px_rgba(255,0,0,0.4)] text-center relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
        
        <div className="text-7xl mb-6">🚫</div>
        <h1 className="text-4xl font-extrabold text-red-500 mb-4 tracking-wider">
          {banInfo.type === 'ip' ? 'ACCESS DENIED' : banInfo.type === 'device' ? 'DEVICE BLOCKED' : 'ACCOUNT SUSPENDED'}
        </h1>
        
        <p className="text-gray-300 text-lg mb-8">
          {banInfo.type === 'ip' 
            ? 'Your IP address has been blocked from accessing Leo Game.' 
            : banInfo.type === 'device'
            ? 'This device has been blocked from accessing Leo Game.'
            : 'Your account has been suspended for violating our guidelines.'}
        </p>

        <div className="bg-black/50 rounded-xl p-6 mb-8 text-left space-y-4 border border-red-900/50">
          <div>
            <span className="text-gray-500 text-sm font-bold block mb-1">REASON</span>
            <span className="text-white font-medium">{banInfo.reason}</span>
          </div>
          <div>
            <span className="text-gray-500 text-sm font-bold block mb-1">
              {banInfo.type === 'account' ? 'SUSPENDED UNTIL' : 'STATUS'}
            </span>
            <span className="text-red-400 font-mono text-lg">
              {banInfo.type === 'account' ? new Date(banInfo.until).toLocaleString() : banInfo.until}
            </span>
          </div>
        </div>

        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}