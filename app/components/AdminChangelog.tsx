'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminChangelog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // 發布表單狀態
  const [version, setVersion] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  
  // 彈窗存活時間
  const [expYears, setExpYears] = useState(0);
  const [expMonths, setExpMonths] = useState(0);
  const [expWeeks, setExpWeeks] = useState(0);
  const [expDays, setExpDays] = useState(7);
  const [expHours, setExpHours] = useState(0);
  const [expMinutes, setExpMinutes] = useState(0);
  const [expSeconds, setExpSeconds] = useState(0);

  // 🚀 編輯狀態
  const [editingLog, setEditingLog] = useState<any>(null);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

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
      version, title, content,
      notification_expires_at: expiresAt
    }]);

    if (error) setMessage('❌ 發布失敗：' + error.message);
    else {
      setMessage('✅ 發布成功！');
      setVersion(''); setTitle(''); setContent('');
      setExpYears(0); setExpMonths(0); setExpWeeks(0); setExpHours(0); setExpMinutes(0); setExpSeconds(0);
      fetchLogs(); 
    }
    setIsPublishing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要永久刪除此版本嗎？')) return;
    await supabase.from('changelogs').delete().eq('id', id);
    fetchLogs();
  };

  const toggleHide = async (id: string, currentStatus: boolean) => {
    await supabase.from('changelogs').update({ is_hidden: !currentStatus }).eq('id', id);
    fetchLogs();
  };

  // 🚀 處理編輯
  const handleOpenEdit = (log: any) => {
    setEditingLog(log);
    setEditImageUrls(log.image_urls || []);
    setEditFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (editImageUrls.length + editFiles.length + newFiles.length > 10) {
        alert('最多只能上傳 10 張圖片！');
        return;
      }
      setEditFiles([...editFiles, ...newFiles]);
    }
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    let newUrls = [...editImageUrls];

    // 上傳新圖片
    for (const file of editFiles) {
      const fileName = `changelog-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('changelog-images').upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from('changelog-images').getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }
    }

    const { error } = await supabase.from('changelogs').update({
      version: editingLog.version,
      title: editingLog.title,
      content: editingLog.content,
      image_urls: newUrls
    }).eq('id', editingLog.id);

    if (error) alert('更新失敗：' + error.message);
    else {
      setEditingLog(null);
      fetchLogs();
    }
    setIsUpdating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左側：發布表單 */}
      <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 shadow-2xl h-fit">
        <h2 className="text-xl font-bold mb-6">📝 發布新版本日誌</h2>
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">版本號</label>
            <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0.0" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">更新標題</label>
            <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">更新內容</label>
            <textarea required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-32 resize-none focus:border-cyan-500" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
            <label className="block text-sm text-cyan-400 font-bold mb-3">📢 前台彈窗存活時間</label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {[{ label: '年', value: expYears, setter: setExpYears }, { label: '月', value: expMonths, setter: setExpMonths }, { label: '週', value: expWeeks, setter: setExpWeeks }, { label: '日', value: expDays, setter: setExpDays }, { label: '時', value: expHours, setter: setExpHours }, { label: '分', value: expMinutes, setter: setExpMinutes }, { label: '秒', value: expSeconds, setter: setExpSeconds }].map((f, i) => (
                <div key={i} className="flex flex-col">
                  <label className="text-[10px] text-gray-500 mb-1 text-center">{f.label}</label>
                  <input type="number" min="0" className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-center text-sm" value={f.value === 0 ? '' : f.value} onChange={(e) => f.setter(Number(e.target.value) || 0)} />
                </div>
              ))}
            </div>
          </div>
          {message && <p className="text-center text-sm text-cyan-300">{message}</p>}
          <button type="submit" disabled={isPublishing} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition">🚀 發布更新日誌</button>
        </form>
      </div>

      {/* 右側：歷史紀錄 */}
      <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 shadow-2xl flex flex-col h-[700px]">
        <h2 className="text-xl font-bold mb-6">📜 歷史發布紀錄 (可編輯/隱藏)</h2>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className={`bg-gray-900 border ${log.is_hidden ? 'border-red-900/50 opacity-60' : 'border-gray-700'} rounded-xl p-4 relative group`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-mono font-bold">{log.version}</span>
                  {log.is_hidden && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">已隱藏</span>}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => toggleHide(log.id, log.is_hidden)} className="text-yellow-500 hover:text-yellow-400 text-sm">{log.is_hidden ? '👁️ 顯示' : '🙈 隱藏'}</button>
                  <button onClick={() => handleOpenEdit(log)} className="text-cyan-500 hover:text-cyan-400 text-sm">✏️ 編輯</button>
                  <button onClick={() => handleDelete(log.id)} className="text-red-500 hover:text-red-400 text-sm">🗑️ 刪除</button>
                </div>
              </div>
              <h3 className="text-white font-bold mb-1">{log.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{new Date(log.created_at).toLocaleString()}</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-3">{log.content}</p>
              
              {/* 數據顯示 */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800 text-xs">
                <span className="text-green-400">👍 {log.likes || 0}</span>
                <span className="text-red-400">👎 {log.dislikes || 0} (隱藏)</span>
                <span className="text-gray-400">🖼️ {log.image_urls?.length || 0} 張圖</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 編輯彈窗 */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">✏️ 編輯版本：{editingLog.version}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">版本號</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" value={editingLog.version} onChange={e => setEditingLog({...editingLog, version: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">更新標題</label>
                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" value={editingLog.title} onChange={e => setEditingLog({...editingLog, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">更新內容</label>
                <textarea className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-32" value={editingLog.content} onChange={e => setEditingLog({...editingLog, content: e.target.value})} />
              </div>
              
              {/* 圖片管理 */}
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                <label className="block text-sm text-gray-400 mb-2">更新圖片 (最多 10 張，目前 {editImageUrls.length + editFiles.length} 張)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="mb-2 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500" />
                <div className="flex gap-2 overflow-x-auto">
                  {editImageUrls.map((url, i) => <img key={i} src={url} className="h-16 w-16 object-cover rounded" />)}
                  {editFiles.map((f, i) => <div key={i} className="h-16 w-16 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500 border border-dashed border-gray-600">待上傳</div>)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditingLog(null)} className="px-6 py-2 rounded-lg text-gray-400 hover:text-white transition">取消</button>
              <button onClick={handleSaveEdit} disabled={isUpdating} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-2 rounded-lg transition">{isUpdating ? '儲存中...' : '儲存變更'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}