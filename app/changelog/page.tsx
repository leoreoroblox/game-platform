'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChangelogPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [likedLogs, setLikedLogs] = useState<string[]>([]); // 記錄當前用戶點過讚的版本
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 留言輸入狀態
  const [inputText, setInputText] = useState<{ [key: string]: string }>({});
  const [selectedReaction, setSelectedReaction] = useState<{ [key: string]: string }>({});

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    let currentUserId = null;
    
    if (session) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setCurrentUser(userData);
      currentUserId = session.user.id;

      // 抓取該用戶所有點過讚的紀錄
      const { data: likesData } = await supabase.from('changelog_likes').select('changelog_id').eq('user_id', currentUserId);
      if (likesData) setLikedLogs(likesData.map(l => l.changelog_id));
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
    fetchData();
  }, []);

  // 🚀 點贊邏輯
  const handleVote = async (logId: string) => {
    // 1. 檢查是否登入
    if (!currentUser) {
      alert('請先登入才能點讚喔！');
      router.push('/login');
      return;
    }

    // 2. 檢查是否已經點過讚
    if (likedLogs.includes(logId)) {
      alert('您已經點過讚囉！');
      return;
    }

    try {
      // 3. 新增點贊紀錄
      const { error: insertError } = await supabase.from('changelog_likes').insert([{
        changelog_id: logId,
        user_id: currentUser.id
      }]);

      if (insertError) throw insertError;

      // 4. 更新該版本的總讚數
      const log = logs.find(l => l.id === logId);
      const newLikesCount = (log.likes || 0) + 1;
      
      await supabase.from('changelogs').update({ likes: newLikesCount }).eq('id', logId);

      // 5. 更新本地畫面狀態 (無需重新整理)
      setLikedLogs([...likedLogs, logId]);
      setLogs(logs.map(l => l.id === logId ? { ...l, likes: newLikesCount } : l));
      
    } catch (err: any) {
      alert('點讚失敗：' + err.message);
    }
  };

  // 🚀 留言與表情邏輯
  const handleComment = async (logId: string) => {
    // 1. 檢查是否登入
    if (!currentUser) {
      alert('請先登入才能留言喔！');
      router.push('/login');
      return;
    }

    const text = inputText[logId];
    if (!text || text.trim() === '') return;

    // 2. 檢查留言次數限制 (最多5次)
    const currentComments = comments[logId] || [];
    const myCommentCount = currentComments.filter(c => c.user_id === currentUser.id).length;
    
    if (myCommentCount >= 5) {
      alert('您在這個版本已經留言達到 5 次上限囉！');
      return;
    }

    // 3. 發送留言
    const { error } = await supabase.from('changelog_comments').insert([{
      changelog_id: logId,
      user_id: currentUser.id,
      username: currentUser.username,
      content: text,
      reaction: selectedReaction[logId] || null
    }]);

    if (error) {
      alert('留言失敗：' + error.message);
    } else {
      setInputText({ ...inputText, [logId]: '' });
      setSelectedReaction({ ...selectedReaction, [logId]: '' });
      fetchData(); // 重新抓取留言
    }
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
            const hasLiked = likedLogs.includes(log.id);
            
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

                  {log.image_urls && log.image_urls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {log.image_urls.map((url: string, i: number) => (
                        <img key={i} src={url} className="rounded-lg object-cover w-full h-32 hover:scale-105 transition cursor-pointer" onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  )}

                  {/* 互動區 (按讚) */}
                  <div className="flex items-center gap-4 border-t border-gray-700 pt-4 mb-4">
                    <button 
                      onClick={() => handleVote(log.id)} 
                      className={`flex items-center gap-2 transition font-bold ${hasLiked ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`}
                    >
                      👍 <span>{log.likes || 0}</span>
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
                          placeholder={currentUser ? "Write a comment..." : "Login to comment..."}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                          value={inputText[log.id] || ''}
                          onChange={(e) => setInputText({ ...inputText, [log.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(log.id)}
                          disabled={!currentUser}
                        />
                        <button 
                          onClick={() => handleComment(log.id)} 
                          disabled={!currentUser}
                          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                        >
                          Send
                        </button>
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