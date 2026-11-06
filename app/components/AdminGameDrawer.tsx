'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminGameDrawer({ game, onClose, onRefresh }: { game: any, onClose: () => void, onRefresh: () => void }) {
  const [title, setTitle] = useState(game.title || '');
  const [creator, setCreator] = useState(game.creator || '');
  const [description, setDescription] = useState(game.description || '');
  const [coverUrl, setCoverUrl] = useState(game.cover_url || '');
  const [category, setCategory] = useState(game.category || 'Action');
  const [isFeatured, setIsFeatured] = useState(game.is_featured || false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('games')
      .update({
        title,
        creator,
        description,
        cover_url: coverUrl,
        category,
        is_featured: isFeatured
      })
      .eq('id', game.id);

    if (error) {
      setMessage('❌ 儲存失敗：' + error.message);
    } else {
      setMessage('✅ 成功更新遊戲資訊！');
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`確定要永久刪除遊戲「${game.title}」嗎？此操作無法復原。`)) return;
    
    setIsSaving(true);
    const { error } = await supabase.from('games').delete().eq('id', game.id);
    
    if (error) {
      setMessage('❌ 刪除失敗：' + error.message);
      setIsSaving(false);
    } else {
      onRefresh();
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose}></div>

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div>
            <h2 className="text-xl font-bold text-white truncate max-w-[250px]">{game.title}</h2>
            <p className="text-sm text-cyan-400 font-mono">ID: {game.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">✖</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">遊戲標題</label>
            <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">創作者名稱</label>
            <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" value={creator} onChange={(e) => setCreator(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">遊戲分類</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Action">Action</option>
              <option value="Simulator">Simulator</option>
              <option value="RPG">RPG</option>
              <option value="Horror">Horror</option>
              <option value="Obby">Obby</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">遊戲簡介</label>
            <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">封面圖網址 (URL)</label>
            <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mt-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-white font-bold block">🌟 設為首頁精選</span>
                <span className="text-xs text-gray-400">這款遊戲將在首頁獲得更多曝光。</span>
              </div>
              <input type="checkbox" className="w-6 h-6 accent-yellow-500" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            </label>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button onClick={handleDelete} disabled={isSaving} className="w-full bg-red-900/30 border border-red-900/50 hover:bg-red-900/50 text-red-400 font-bold py-2 rounded-lg transition text-sm">
              🗑️ 永久刪除此遊戲
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-950">
          {message && <p className="text-center text-sm mb-3 text-cyan-300">{message}</p>}
          <button onClick={handleSave} disabled={isSaving} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
            {isSaving ? '處理中...' : '儲存遊戲變更'}
          </button>
        </div>

      </div>
    </>
  );
}