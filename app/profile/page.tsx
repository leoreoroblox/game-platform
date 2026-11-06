'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [myGames, setMyGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState('');
  
  // 自訂 Toast 彈窗狀態
  const [toast, setToast] = useState<boolean>(false);
  
  const router = useRouter();

  // 統一顯示 Coming soon
  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000); // 3秒後自動消失
  };

  const fetchProfileData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userData) {
      setProfile(userData);
      const { data: gamesData } = await supabase
        .from('games')
        .select('*')
        .eq('creator', userData.username);
      if (gamesData) setMyGames(gamesData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpgradeVIP = async () => {
    if (profile.leo_coins < 500) {
      setMessage('Not enough Leo Coins!');
      return;
    }
    setUpgrading(true);
    setMessage('');

    try {
      const now = new Date();
      let newExpiry = new Date();
      if (profile.vip_expires_at && new Date(profile.vip_expires_at) > now) {
        newExpiry = new Date(profile.vip_expires_at);
      }
      newExpiry.setDate(newExpiry.getDate() + 30);

      await supabase.from('users').update({
        leo_coins: profile.leo_coins - 500,
        vip_level: 'VIP',
        vip_expires_at: newExpiry.toISOString()
      }).eq('id', profile.id);

      setMessage('Successfully subscribed!');
      await fetchProfileData(); 
    } catch (err: any) {
      setMessage('Upgrade failed.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Profile...</div>;
  if (!profile) return null;

  const isVipActive = profile.vip_expires_at && new Date(profile.vip_expires_at) > new Date();
  const expiryDate = profile.vip_expires_at ? new Date(profile.vip_expires_at).toLocaleDateString() : '';

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 relative">
      
      {/* 🚀 自訂高級紅色 Toast 彈窗 (移到了頂部) */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-gray-800 border border-gray-600 px-8 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <span className="text-yellow-400 text-lg">🚧</span>
          <span className="text-gray-200 font-bold tracking-wide">Coming soon!</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-20">
        
        {/* 頂部大橫幅 */}
        <div className="w-full h-48 md:h-64 rounded-2xl bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-900 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
          <button onClick={showToast} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-bold backdrop-blur-sm transition">
            3D View
          </button>
        </div>

        {/* 玩家資料區 */}
        <div className="relative px-6 md:px-10 -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex-shrink-0 flex items-center justify-center text-6xl font-bold border-4 border-gray-900 shadow-xl relative z-10 ${
            isVipActive ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black ring-4 ring-yellow-500/50 shadow-[0_0_30px_rgba(255,215,0,0.6)]' : 'bg-cyan-600 text-white'
          }`}>
            {profile.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
            <h1 className={`text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-2 ${isVipActive ? 'text-yellow-400' : 'text-white'}`}>
              {profile.username}
              {isVipActive && <span title="VIP" className="text-2xl">👑</span>}
              {profile.uid === 'UID-1' && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded ml-2">FOUNDER</span>}
            </h1>
            <p className="text-gray-400 text-lg mt-1">@{profile.username.toLowerCase()}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm">
              <button onClick={showToast} className="bg-gray-800/80 hover:bg-gray-700 px-3 py-1 rounded-md backdrop-blur-sm transition"><strong>0</strong> Friends</button>
              <button onClick={showToast} className="bg-gray-800/80 hover:bg-gray-700 px-3 py-1 rounded-md backdrop-blur-sm transition"><strong>0</strong> Followers</button>
              <button onClick={showToast} className="bg-gray-800/80 hover:bg-gray-700 px-3 py-1 rounded-md backdrop-blur-sm transition"><strong>0</strong> Following</button>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button onClick={showToast} className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-bold transition text-sm">
              Edit Profile
            </button>
            <button onClick={showToast} className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-bold transition text-sm">
              ...
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">About</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Welcome to my Leo Game profile! I am a creator passionate about building awesome worlds. 
                UID: {profile.uid}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">Currently Wearing</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <button onClick={showToast} key={i} className="bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center aspect-square border border-gray-700 hover:border-gray-500 transition">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg mb-2"></div>
                    <span className="text-xs text-gray-400">Item {i}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">Creations</h2>
              {myGames.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                  <p className="text-gray-400 mb-4">You haven't created any games yet.</p>
                  <Link href="/create" className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold transition text-sm">
                    Create New Game
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {myGames.map(game => (
                    <Link href={`/game/${game.id}`} key={game.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-400 transition cursor-pointer group">
                      <div className="h-24 bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-gray-600">🎮</div>
                      <div className="p-3">
                        <h3 className="font-bold text-white text-sm truncate">{game.title}</h3>
                        <p className="text-xs text-cyan-400 mt-1">🟢 {game.players} Playing</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border shadow-xl relative overflow-hidden ${isVipActive ? 'border-yellow-500/50' : 'border-gray-700'}`}>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                👑 Leo VIP
              </h3>
              <div className="w-full mt-4 bg-gray-900 rounded-xl p-3 flex justify-between items-center border border-gray-700 mb-4">
                <span className="text-gray-400 text-sm">Leo Coins</span>
                <span className="text-lg font-bold text-yellow-400">🪙 {profile.leo_coins}</span>
              </div>

              {isVipActive ? (
                <div className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/30 text-center">
                  VIP Active until {expiryDate}
                </div>
              ) : (
                <button 
                  onClick={handleUpgradeVIP}
                  disabled={upgrading}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg transition text-sm"
                >
                  {upgrading ? 'Processing...' : 'Subscribe (500 Coins)'}
                </button>
              )}
              {message && <p className="text-cyan-300 text-xs text-center mt-2">{message}</p>}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">Store <span className="text-sm text-gray-500">›</span></h2>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <button onClick={showToast} key={i} className="bg-gray-800 rounded-xl p-3 flex flex-col items-center border border-gray-700 hover:border-gray-500 transition">
                    <div className="w-12 h-12 bg-gray-700 rounded-full mb-2"></div>
                    <span className="text-xs text-gray-400">Item {i}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}