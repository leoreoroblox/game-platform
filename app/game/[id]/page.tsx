'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Footer from '../../components/Footer';

// 1. 將原本的內容包裝成子組件，解決 useParams 的報錯
function GameDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'store' | 'servers'>('about');

  useEffect(() => {
    async function fetchGame() {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) setGame(data);
      setLoading(false);
    }
    if (params.id) fetchGame();
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  if (!game) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Game not found.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex-1 pt-24 pb-10 px-8">
        <div className="max-w-6xl mx-auto">
          
          <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition text-sm">
            ← Back to Explore
          </button>

          {/* 上半部：封面與下載區 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="w-full h-[400px] bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 relative">
                <img 
                  src={game.cover_url || 'https://via.placeholder.com/800x400?text=No+Cover'} 
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
              <p className="text-cyan-400 mb-6 flex items-center gap-2">
                By <span className="font-bold text-white hover:underline cursor-pointer">{game.creator}</span>
              </p>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                <div className="flex justify-between items-center mb-6 text-sm text-gray-400">
                  <span>🟢 {game.players} Players Online</span>
                  <span>Free to Play</span>
                </div>
                <button 
                  onClick={() => alert(`Launching Leo Game Client to download: ${game.zip_url}`)}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition shadow-[0_0_20px_rgba(0,255,204,0.4)] flex items-center justify-center gap-3 text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Launch Client
                </button>
              </div>
            </div>
          </div>

          {/* 中間：Roblox 風格 Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button 
              onClick={() => setActiveTab('about')} 
              className={`px-8 py-3 font-bold text-lg border-b-2 transition ${activeTab === 'about' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab('store')} 
              className={`px-8 py-3 font-bold text-lg border-b-2 transition ${activeTab === 'store' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Store
            </button>
            <button 
              onClick={() => setActiveTab('servers')} 
              className={`px-8 py-3 font-bold text-lg border-b-2 transition ${activeTab === 'servers' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Servers
            </button>
          </div>

          {/* Tab 內容區 */}
          <div className="min-h-[200px] text-gray-300 leading-relaxed">
            {activeTab === 'about' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                <p>{game.description || 'No description provided for this game.'}</p>
              </div>
            )}
            
            {activeTab === 'store' && (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-gray-500 mb-4">This game does not have any items for sale yet.</p>
              </div>
            )}

            {activeTab === 'servers' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Public Servers</h2>
                <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center mb-2 border border-gray-700">
                  <div>
                    <p className="text-white font-bold">{game.creator}'s Server</p>
                    <p className="text-sm text-gray-500">Ping: 45ms</p>
                  </div>
                  <div className="text-cyan-400 font-bold">
                    {Math.floor(Math.random() * 5) + 1} / 10 Players
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* 底部 Footer */}
      <Footer />
    </div>
  );
}

// 2. 主頁面使用 Suspense 包裹
export default function GameDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>}>
      <GameDetailContent />
    </Suspense>
  );
}