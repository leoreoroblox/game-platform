'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import GameCard from './components/GameCard';
import { supabase } from '../lib/supabase';

// 🚀 關鍵修復：告訴 Next.js 此頁面允許阻擋導航

function ExploreContent() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Action', 'Simulator', 'RPG', 'Horror', 'Obby'];

  useEffect(() => {
    async function fetchGames() {
      const { data, error } = await supabase.from('games').select('*');
      if (data) setGames(data);
      setLoading(false);
    }
    fetchGames();
  }, []);

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (game.creator && game.creator.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-10 pb-20 px-8 max-w-7xl mx-auto">
      {/* 英雄區塊 */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 tracking-tight">
          Play. Create. Connect.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10">
          Welcome to Leo Game — where every player is a creator.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-[0_0_20px_rgba(0,255,204,0.4)] hover:shadow-[0_0_30px_rgba(0,255,204,0.8)]">
            Download Client
          </button>
          <button className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-gray-700 transition">
            Learn More
          </button>
        </div>
      </div>

      {/* 搜尋與分類區塊 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
                activeCategory === cat 
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,255,204,0.4)]' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search games..." 
            className="w-full bg-gray-800 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 遊戲展示區 */}
      {loading ? (
        <div className="text-center text-cyan-400 py-20 animate-pulse">Loading games...</div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-xl mb-2">No games found 😢</p>
          <p className="text-sm">Try adjusting your search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard 
              key={game.id} 
              id={game.id}
              title={game.title} 
              creator={game.creator || 'Unknown Creator'} 
              players={String(game.players)} 
              cover_url={game.cover_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<div className="pt-32 text-center text-cyan-400">Loading...</div>}>
        <ExploreContent />
      </Suspense>
    </main>
  );
}