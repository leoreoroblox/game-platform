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
    
    const { error } = await supabase.from('changelogs').insert([{
      version,
      title,
      content
    }]);

    if (error) {
      setMessage('❌ 發布失敗：' + error.message);
    } else {
      setMessage('✅ 版本更新已成功發布！');
      setVersion('');
      setTitle('');
      setContent('');
      fetchLogs(); // 重新載入列表
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
            <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：Beta 測試正式啟動！" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">更新內容 (支援換行)</label>
            <textarea required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-32 resize-none focus:outline-none focus:border-cyan-500" value={content} onChange={(e) => setContent(e.target.value)} placeholder="1. 新增了遊戲啟動器&#10;2. 優化了首頁載入速度" />
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
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}