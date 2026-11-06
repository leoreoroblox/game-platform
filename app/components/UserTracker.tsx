'use client';
import { useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { supabase } from '../../lib/supabase';

export default function UserTracker() {
  useEffect(() => {
    const trackUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // 沒登入就不追蹤

      try {
        // 1. 抓取設備指紋
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const deviceId = result.visitorId;

        // 2. 抓取真實 IP
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const currentIp = ipData.ip;

        // 3. 更新到資料庫
        await supabase
          .from('users')
          .update({ 
            device_id: deviceId, 
            current_ip: currentIp 
          })
          .eq('id', session.user.id);

      } catch (err) {
        console.error('追蹤設備資訊失敗:', err);
      }
    };

    // 延遲 2 秒執行，避免影響網頁載入
    const timer = setTimeout(trackUser, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null; // 這個組件不需要顯示任何東西
}