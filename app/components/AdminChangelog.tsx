'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminChangelog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // 表單狀態
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  // 🚀 彈窗存活時間狀態
  const [expYears, setExpYears] = useState(0);
  const [expMonths, setExpMonths] = useState(0);
  const [expWeeks, setExpWeeks] = useState(0);
  const [expDays, setExpDays] = useState(7); // 預設 7 天
  const [expHours, setExpHours] = useState(0);
  const [expMinutes, setExpMinutes] = useState(0);
  const [expSeconds, setExpSeconds] = useState(0);

  const fetchLogs = async () => {
    const { data } = await supabase.from('changelogs').select('*').order('created_at', { ascending: false });
    if (data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version || !title || !content) return;
    setIsPublishing(true);
    
    // 🚀 計算彈窗過期時間
    let expiresAt = null;
    if (expYears > 0 || expMonths > 0 || expWeeks > 0 || expDays > 0 || expHours > 0 || expMinutes > 0 || expSeconds > 0) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + Number(expYears));
      d.setMonth(d.getMonth() + Number(expMonths));
      d.setDate(d.getDate() + (Number(expWeeks) * 7) + Number(expDays));
      d.setHours(d.getHours() + Number(expHours));
      d.setMinutes(d.getMinutes() + Number(expMinutes));
      d.setSeconds(d.getSeconds() + Number(expSeconds));
      expiresAt = d.toISOString();
    }

    const { error } = await supabase.from('changelogs').insert([{
      version,
      title,
      content,
      notification_expires_at: expiresAt
    }]);

    if (error) {
      setMessage('❌ 發布失敗：' + error.message);
    } else {
      setMessage('✅ 版本更新已成功發布！');
      setVersion(''); setTitle(''); setContent('');
      // 重置時間
      setExpYears(0); setExpMonths(0); setExpWeeks(0); setExpHours(0); setExpMinutes(0); setExpSeconds(0);
      fetchLogs(); 
    }
    setIsPublishing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這則更新日誌嗎？')) return;
    await supabase.from('changelogs').delete().eq('id', id);
    fetchLogs();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左側：發布表單 */}
      <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold mb-6">📝 發布新版本日誌</h2>
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">版本號 (例如：v1.0.0)</label>
            <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0.0" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">更新標題</label>
            <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：Alpha 測試正式啟動！" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">更新內容 (支援換行)</label>
            <textarea required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-32 resize-none focus:outline-none focus:border-cyan-500" value={content} onChange={(e) => setContent(e.target.value)} placeholder="1. 新增了遊戲啟動器&#10;2. 優化了首頁載入速度" />
          </div>

          {/* 🚀 彈窗存活時間設定 */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
            <label className="block text-sm text-cyan-400 font-bold mb-3">📢 前台彈窗存活時間 (設定為 0 則不彈出)</label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {[
                { label: '年', value: expYears, setter: setExpYears },
                { label: '月', value: expMonths, setter: setExpMonths },
                { label: '週', value: expWeeks, setter: setExpWeeks },
                { label: '日', value: expDays, setter: setExpDays },
                { label: '時', value: expHours, setter: setExpHours },
                { label: '分', value: expMinutes, setter: setExpMinutes },
                { label: '秒', value: expSeconds, setter: setExpSeconds }
              ].map((f, i) => (
                <div key={i} className="flex flex-col">
                  <label className="text-[10px] text-gray-500 mb-1 text-center">{f.label}</label>
                  <input type="number" min="0" placeholder="0" className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-center text-sm focus:outline-none focus:border-cyan-500" value={f.value === 0 ? '' : f.value} onChange={(e) => f.setter(Number(e.target.value) || 0)} />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">例如設定 7 日，玩家在發布後 7 天內進入網站會看到提示，超過 7 天則不再自動彈出。</p>
          </div>
          
          {message && <p className="text-center text-sm text-cyan-300">{message}</p>}
          
          <button type="submit" disabled={isPublishing} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
            {isPublishing ? '發布中...' : '🚀 發布更新日誌'}
          </button>
        </form>
      </div>

      {/* 右側：歷史紀錄 */}
      <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 shadow-2xl flex flex-col h-[600px]">
        <h2 className="text-xl font-bold mb-6">📜 歷史發布紀錄</h2>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {loading ? (
            <p className="text-gray-500 animate-pulse">載入中...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">目前尚無更新紀錄。</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-cyan-400 font-mono font-bold">{log.version}</span>
                  <button onClick={() => handleDelete(log.id)} className="text-red-500 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition">🗑️ 刪除</button>
                </div>
                <h3 className="text-white font-bold mb-1">{log.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{new Date(log.created_at).toLocaleString('en-US')}</p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{log.content}</p>
                {log.notification_expires_at && (
                  <p className="text-[10px] text-yellow-500 mt-2 border-t border-gray-700 pt-2">彈窗存活至：{new Date(log.notification_expires_at).toLocaleString('en-US')}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}