'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function UpdateNotifier() {
  const [latestLog, setLatestLog] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      // 1. 抓取最新一筆更新日誌
      const { data } = await supabase
        .from('changelogs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!data) return;

      // 2. 檢查是否有設定過期時間，且是否已過期
      if (data.notification_expires_at && new Date(data.notification_expires_at) < new Date()) {
        return; // 已過期，不顯示
      }

      // 3. 檢查玩家是否已經看過這個版本的提示 (用 localStorage 記錄)
      const seenLogs = JSON.parse(localStorage.getItem('leo_seen_updates') || '[]');
      if (seenLogs.includes(data.id)) {
        return; // 已經看過，不顯示
      }

      // 如果都通過，就顯示彈窗
      setLatestLog(data);
      setIsVisible(true);
    };

    // 延遲 2 秒執行，避免影響網頁載入體驗
    const timer = setTimeout(checkUpdate, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (latestLog) {
      // 記錄到 localStorage，下次不再彈出
      const seenLogs = JSON.parse(localStorage.getItem('leo_seen_updates') || '[]');
      if (!seenLogs.includes(latestLog.id)) {
        seenLogs.push(latestLog.id);
        localStorage.setItem('leo_seen_updates', JSON.stringify(seenLogs));
      }
    }
  };

  if (!isVisible || !latestLog) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        
        {/* 背景光暈 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-cyan-900/50 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-cyan-800 mb-3 inline-block">
                🚀 {latestLog.version} Update
              </span>
              <h2 className="text-2xl font-bold text-white leading-tight">{latestLog.title}</h2>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-white text-2xl transition">✖</button>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 max-h-[40vh] overflow-y-auto mb-6 custom-scrollbar">
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{latestLog.content}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(0,255,204,0.3)]">
              開始探索 Leo Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}