'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [myGames, setMyGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<boolean>(false);

  // 追蹤系統狀態
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // 追蹤清單彈窗狀態
  const [showFollowList, setShowFollowList] = useState(false);
  const [followList, setFollowList] = useState<any[]>([]);
  const [followListTitle, setFollowListTitle] = useState('');

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const fetchUserData = async () => {
    if (!params.uid) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) setCurrentUserId(session.user.id);

    // 1. 取得目標玩家資料
    const { data: userData } = await supabase.from('users').select('*').eq('uid', params.uid).single();
    if (userData) {
      setProfile(userData);
      
      // 取得該玩家的遊戲
      const { data: gamesData } = await supabase.from('games').select('*').eq('creator', userData.username);
      if (gamesData) setMyGames(gamesData);

      // 2. 取得追蹤數據
      const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userData.id);
      const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userData.id);
      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);

      // 3. 檢查自己是否已追蹤他
      if (session && session.user.id !== userData.id) {
        const { data: followRecord } = await supabase.from('follows').select('*').eq('follower_id', session.user.id).eq('following_id', userData.id).single();
        if (followRecord) setIsFollowing(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, [params.uid]);

  // 處理追蹤/取消追蹤
  const handleFollowToggle = async () => {
    if (!currentUserId) { router.push('/login'); return; }
    setIsFollowLoading(true);

    if (isFollowing) {
      // 取消追蹤
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profile.id);
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      // 新增追蹤
      await supabase.from('follows').insert([{ follower_id: currentUserId, following_id: profile.id }]);
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
    setIsFollowLoading(false);
  };

  // 打開追蹤清單
  const openFollowList = async (type: 'followers' | 'following') => {
    setFollowListTitle(type === 'followers' ? 'Followers' : 'Following');
    setFollowList([]);
    setShowFollowList(true);

    if (type === 'followers') {
      // 查誰追蹤了我
      const { data } = await supabase.from('follows').select('follower_id, users!follows_follower_id_fkey(username, uid)').eq('following_id', profile.id);
      if (data) setFollowList(data.map((d: any) => d.users));
    } else {
      // 查我追蹤了誰
      const { data } = await supabase.from('follows').select('following_id, users!follows_following_id_fkey(username, uid)').eq('follower_id', profile.id);
      if (data) setFollowList(data.map((d: any) => d.users));
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Profile...</div>;
  if (!profile) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">User not found.</div>;

  const isOwnProfile = currentUserId === profile.id;
  const isVipActive = profile.vip_expires_at && new Date(profile.vip_expires_at) > new Date();
  const expiryDate = profile.vip_expires_at ? new Date(profile.vip_expires_at).toLocaleDateString() : '';
  const joinYear = new Date(profile.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 relative">
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-gray-800 border border-gray-600 px-8 py-3 rounded-xl shadow-2xl flex items-center gap-3">
          <span className="text-yellow-400 text-lg">🚧</span>
          <span className="text-gray-200 font-bold tracking-wide">Coming soon!</span>
        </div>
      </div>

      {/* 追蹤清單彈窗 */}
      {showFollowList && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">{followListTitle}</h2>
              <button onClick={() => setShowFollowList(false)} className="text-gray-500 hover:text-white text-xl">✖</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {followList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users found.</p>
              ) : (
                followList.map((u, i) => (
                  <Link key={i} href={`/users/${u.uid}`} onClick={() => setShowFollowList(false)} className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl hover:bg-gray-700 transition">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`} className="w-10 h-10 rounded-full bg-gray-800" />
                    <span className="font-bold">{u.username}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-20">
        <div className="w-full h-48 md:h-64 rounded-2xl bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-900 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
        </div>

        <div className="relative px-6 md:px-10 -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex-shrink-0 overflow-hidden border-4 border-gray-900 shadow-xl relative z-10 ${isVipActive ? 'ring-4 ring-yellow-500/50 shadow-[0_0_30px_rgba(255,215,0,0.6)]' : ''}`}>
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`} alt={profile.username} className="w-full h-full object-cover bg-gray-800" />
          </div>
          
          <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
            <h1 className={`text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-2 ${isVipActive ? 'text-yellow-400' : 'text-white'}`}>
              {profile.username}
              {profile.uid === '1' && (
                <svg className="w-7 h-7 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>
              )}
              {isVipActive && <span title="VIP" className="text-2xl">👑</span>}
            </h1>
            <p className="text-gray-400 text-lg mt-1">@{profile.username.toLowerCase().replace(/\s+/g, '')}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm">
              <button onClick={showToast} className="bg-gray-800/80 hover:bg-gray-700 px-3 py-1 rounded-md backdrop-blur-sm transition"><strong>0</strong> Friends</button>
              
              {/* 🚀 真實的追蹤按鈕 */}
              <button onClick={() => openFollowList('followers')} className="bg-gray-800/80 hover:bg-gray-700 px-3 py-1 rounded-md backdrop-blur-sm transition"><strong>{followersCount}</strong> Followers</button>
              <button onClick={() => openFollowList('following')} className="bg-gray-800/80 hover:bg-gray-700 px-3 py-1 rounded-md backdrop-blur-sm transition"><strong>{followingCount}</strong> Following</button>
            </div>
          </div>

          {/* 如果不是自己的主頁，顯示追蹤按鈕 */}
          {!isOwnProfile && currentUserId && (
            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button 
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg font-bold transition text-sm shadow-lg ${
                  isFollowing 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,204,0.3)]'
                }`}
              >
                {isFollowLoading ? '...' : isFollowing ? 'Unfollow' : '+ Follow'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">About</h2>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {profile.bio || `Welcome to ${profile.username}'s Leo Game profile!`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-700/50 pt-4">
                {profile.social_link && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Social Link</h3>
                    <a href={profile.social_link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-sm truncate block">{profile.social_link}</a>
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Join Date</h3>
                  <p className="text-gray-300 text-sm">Joined in {joinYear}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Creations</h2>
              {myGames.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                  <p className="text-gray-400">This user hasn't created any games yet.</p>
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
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">👑 Leo VIP</h3>
              {isVipActive ? (
                <div className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/30 text-center mt-4">
                  VIP Active until {expiryDate}
                </div>
              ) : (
                <div className="text-gray-400 text-sm text-center mt-4">Not a VIP member.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}