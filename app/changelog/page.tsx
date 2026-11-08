'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function ChangelogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 留言輸入狀態
  const [inputText, setInputText] = useState<{ [key: string]: string }>({});
  const [selectedReaction, setSelectedReaction] = useState<{ [key: string]: string }>({});

  const fetchLogsAndUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setCurrentUser(userData);
    }

    // 抓取沒有被隱藏的版本
    const { data } = await supabase.from('changelogs').select('*').eq('is_hidden', false).order('created_at', { ascending: false });
    if (data) {
      setLogs(data);
      // 抓取每個版本的留言
      const commentPromises = data.map(async (log) => {
        const { data: cData } = await supabase.from('changelog_comments').select('*').eq('changelog_id', log.id).order('created_at', { ascending: true });
        return { id: log.id, comments: cData || [] };
      });
      const results = await Promise.all(commentPromises);
      const commentMap: any = {};
      results.forEach(r => commentMap[r.id] = r.comments);
      setComments(commentMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogsAndUser();
  }, []);

  const handleVote = async (id: string, type: 'like' | 'dislike') => {
    const votedKey = `voted_${type}_${id}`;
    if (localStorage.getItem(votedKey)) return; // 已經點過

    const log = logs.find(l => l.id === id);
    if (!log) return;

    const updateField = type === 'like' ? 'likes' : 'dislikes';
    await supabase.from('changelogs').update({ [updateField]: (log[updateField] || 0) + 1 }).eq('id', id);
    
    localStorage.setItem(votedKey, 'true');
    fetchLogsAndUser();
  };

  const handleComment = async (id: string) => {
    if (!currentUser) return alert('請先登入才能留言喔！');
    const text = inputText[id];
    if (!text || text.trim() === '') return;

    await supabase.from('changelog_comments').insert([{
      changelog_id: id,
      user_id: currentUser.id,
      username: currentUser.username,
      content: text,
      reaction: selectedReaction[id] || null
    }]);

    setInputText({ ...inputText, [id]: '' });
    setSelectedReaction({ ...selectedReaction, [id]: '' });
    fetchLogsAndUser();
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-cyan-400 flex items-center justify-center animate-pulse">Loading Updates...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-6 inline-block font-bold">← Back to Home</Link>
        <h1 className="text-4xl font-bold mb-2">Changelog</h1>
        <p className="text-gray-400 mb-12">See what's new in Leo Game and leave your feedback!</p>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
          {logs.map((log) => {
            const logComments = comments[log.id] || [];
            
            return (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* 時間軸圓點 */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-900 text-cyan-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                
                {/* 內容卡片 */}
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-cyan-400 font-mono font-bold text-xl">{log.version}</span>
                    <span className="text-gray-500 text-xs">{new Date(log.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-4">{log.title}</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed mb-4">{log.content}</p>

                  {/* 圖片展示 */}
                  {log.image_urls && log.image_urls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {log.image_urls.map((url: string, i: number) => (
                        <img key={i} src={url} className="rounded-lg object-cover w-full h-32 hover:scale-105 transition cursor-pointer" onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  )}

                  {/* 互動區 (按讚/留言) */}
                  <div className="flex items-center gap-4 border-t border-gray-700 pt-4 mb-4">
                    <button onClick={() => handleVote(log.id, 'like')} className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition font-bold">
                      👍 <span>{log.likes || 0}</span>
                    </button>
                    <button onClick={() => handleVote(log.id, 'dislike')} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition font-bold">
                      👎
                    </button>
                  </div>

                  {/* 留言區 */}
                  <div className="bg-gray-900 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-3">Comments ({logComments.length})</h4>
                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                      {logComments.map(c => (
                        <div key={c.id} className="bg-gray-800 p-2 rounded-lg text-sm">
                          <span className="text-cyan-400 font-bold mr-2">{c.username}</span>
                          {c.reaction && <span className="mr-2">{c.reaction}</span>}
                          <span className="text-gray-300">{c.content}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {['🔥', '❤️', '🎉', '😮', '😢'].map(emoji => (
                          <button key={emoji} onClick={() => setSelectedReaction({ ...selectedReaction, [log.id]: emoji })} className={`p-1 rounded hover:bg-gray-700 transition ${selectedReaction[log.id] === emoji ? 'bg-gray-700 ring-2 ring-cyan-500' : ''}`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Write a comment..." 
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                          value={inputText[log.id] || ''}
                          onChange={(e) => setInputText({ ...inputText, [log.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(log.id)}
                        />
                        <button onClick={() => handleComment(log.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">Send</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}