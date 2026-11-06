'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import AdminUserDrawer from '../components/AdminUserDrawer';
import AdminGameDrawer from '../components/AdminGameDrawer';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [drawerUser, setDrawerUser] = useState<any>(null);
  const [drawerGame, setDrawerGame] = useState<any>(null);

  const [globalCoins, setGlobalCoins] = useState<number | ''>('');
  const [notifyCoins, setNotifyCoins] = useState(true); 
  const [isGloballyUpdating, setIsGloballyUpdating] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState<any>({
    announcement_text: '',
    announcement_speed: 20,
    announcement_direction: 'left',
    announcement_text_color: '#ffffff',
    announcement_bg_color: '#06b6d4',
    announcement_pause_hover: true,
    announcement_font_size: 'text-sm',
    maintenance_mode: false,
    maintenance_type: 'Scheduled Maintenance',
    maintenance_message: 'Leo Game is currently under maintenance.',
    maintenance_pre_warning: false,
    pre_warning_minutes: 10
  });

  // 啟動維護彈窗狀態
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [startImmediately, setStartImmediately] = useState(true); 
  
  // 🚀 新增：延遲開始的 年月日時分秒
  const [startDelayYears, setStartDelayYears] = useState(0);
  const [startDelayMonths, setStartDelayMonths] = useState(0);
  const [startDelayDays, setStartDelayDays] = useState(0);
  const [startDelayHours, setStartDelayHours] = useState(0);
  const [startDelayMinutes, setStartDelayMinutes] = useState(1);
  const [startDelaySeconds, setStartDelaySeconds] = useState(0);

  // 維護時長
  const [mYears, setMYears] = useState(0);
  const [mMonths, setMMonths] = useState(0);
  const [mDays, setMDays] = useState(0);
  const [mHours, setMHours] = useState(0);
  const [mMinutes, setMMinutes] = useState(10); 
  const [mSeconds, setMSeconds] = useState(0);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const fetchData = async () => {
    const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    const { data: gamesData } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (usersData) setUsers(usersData);
    if (gamesData) setGames(gamesData);
    if (settingsData) setSiteSettings(settingsData);
  };

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single();
      if (userData?.role === 'admin') { setIsAdmin(true); fetchData(); } else { router.push('/'); }
      setCheckingAuth(false);
    }
    checkAdmin();
  }, [router]);

  const handleGlobalCoins = async () => {
    if (!globalCoins || globalCoins === 0) return;
    if (!confirm(`確定要為全站所有玩家發放 ${globalCoins} 金幣嗎？`)) return;
    setIsGloballyUpdating(true);
    try {
      await Promise.all(users.map(u => supabase.from('users').update({ leo_coins: (u.leo_coins || 0) + globalCoins }).eq('id', u.id)));
      if (notifyCoins) {
        await supabase.from('site_settings').update({
          announcement_text: `🎉 感謝全服玩家支持！管理員已向大家發放 ${globalCoins} Leo Coins！`,
          announcement_bg_color: '#eab308',
          announcement_text_color: '#000000',
          announcement_speed: 15,
        }).eq('id', 1);
      }
      showToast(`✅ 已成功為全服玩家發放 ${globalCoins} 金幣！`); setGlobalCoins(''); fetchData();
    } catch (err) { showToast('❌ 發放失敗'); } finally { setIsGloballyUpdating(false); }
  };

  const handleSaveMarquee = async () => {
    const { error } = await supabase.from('site_settings').update({
      announcement_text: siteSettings.announcement_text,
      announcement_speed: siteSettings.announcement_speed,
      announcement_direction: siteSettings.announcement_direction,
      announcement_text_color: siteSettings.announcement_text_color,
      announcement_bg_color: siteSettings.announcement_bg_color,
      announcement_pause_hover: siteSettings.announcement_pause_hover,
      announcement_font_size: siteSettings.announcement_font_size,
    }).eq('id', 1);
    if (error) showToast('❌ 跑馬燈儲存失敗'); else showToast('✅ 跑馬燈已發布！');
  };

  const handleStartMaintenance = async () => {
    const now = new Date();
    
    // 🚀 計算開始時間
    let startTime = new Date(now);
    if (!startImmediately) {
      startTime.setFullYear(startTime.getFullYear() + Number(startDelayYears));
      startTime.setMonth(startTime.getMonth() + Number(startDelayMonths));
      startTime.setDate(startTime.getDate() + Number(startDelayDays));
      startTime.setHours(startTime.getHours() + Number(startDelayHours));
      startTime.setMinutes(startTime.getMinutes() + Number(startDelayMinutes));
      startTime.setSeconds(startTime.getSeconds() + Number(startDelaySeconds));
    }
    
    // 計算結束時間 (開始時間 + 預計時長)
    const endTime = new Date(startTime);
    endTime.setFullYear(endTime.getFullYear() + Number(mYears));
    endTime.setMonth(endTime.getMonth() + Number(mMonths));
    endTime.setDate(endTime.getDate() + Number(mDays));
    endTime.setHours(endTime.getHours() + Number(mHours));
    endTime.setMinutes(endTime.getMinutes() + Number(mMinutes));
    endTime.setSeconds(endTime.getSeconds() + Number(mSeconds));

    const { error } = await supabase.from('site_settings').update({
      maintenance_type: siteSettings.maintenance_type,
      maintenance_message: siteSettings.maintenance_message,
      maintenance_start_time: startImmediately ? null : startTime.toISOString(),
      maintenance_end_time: endTime.toISOString(),
      maintenance_mode: startImmediately,
      maintenance_pre_warning: siteSettings.maintenance_pre_warning
    }).eq('id', 1);

    if (error) {
      showToast('❌ 啟動失敗');
    } else {
      showToast('✅ 維護已排程/啟動！');
      setShowMaintenanceModal(false);
      fetchData();
    }
  };

  const handleStopMaintenance = async () => {
    const { error } = await supabase.from('site_settings').update({
      maintenance_mode: false,
      maintenance_start_time: null,
      maintenance_end_time: null
    }).eq('id', 1);
    if (error) showToast('❌ 結束失敗'); else { showToast('✅ 維護已結束'); fetchData(); }
  };

  if (checkingAuth) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Checking Permissions...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative">
      {toastMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl z-[9999] animate-pulse">{toastMsg}</div>}
      {drawerUser && <AdminUserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onRefresh={fetchData} />}
      {drawerGame && <AdminGameDrawer game={drawerGame} onClose={() => setDrawerGame(null)} onRefresh={fetchData} />}

      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-red-500">⚠️ 啟動全站維護</h2>
            
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              
              {/* 🚀 立刻開始選項 */}
              <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <input type="checkbox" className="w-5 h-5 accent-red-500" checked={startImmediately} onChange={(e) => setStartImmediately(e.target.checked)} />
                <span className="text-sm font-bold text-white">立刻開始 (不延遲)</span>
              </div>

              {/* 🚀 延遲開始設定 (精準到秒) */}
              {!startImmediately && (
                <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                  <label className="block text-sm text-gray-400 mb-3 font-bold">設定多久之後開始倒數？</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { label: '年', value: startDelayYears, setter: setStartDelayYears },
                      { label: '月', value: startDelayMonths, setter: setStartDelayMonths },
                      { label: '日', value: startDelayDays, setter: setStartDelayDays },
                      { label: '時', value: startDelayHours, setter: setStartDelayHours },
                      { label: '分', value: startDelayMinutes, setter: setStartDelayMinutes },
                      { label: '秒', value: startDelaySeconds, setter: setStartDelaySeconds }
                    ].map((f, i) => (
                      <div key={i} className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1 text-center">{f.label}</label>
                        <input type="number" min="0" placeholder="0" className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-center" value={f.value === 0 ? '' : f.value} onChange={(e) => f.setter(Number(e.target.value) || 0)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">維護類型</label>
                <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" value={siteSettings.maintenance_type} onChange={(e) => setSiteSettings({...siteSettings, maintenance_type: e.target.value})}>
                  <option value="Scheduled Maintenance">⏰ 定時維護</option>
                  <option value="Major System Upgrade">🚧 重大升級</option>
                  <option value="Emergency Fix">🛑 緊急修復</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">提示訊息 (支援換行)</label>
                <textarea className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-24 resize-none" value={siteSettings.maintenance_message} onChange={(e) => setSiteSettings({...siteSettings, maintenance_message: e.target.value})} placeholder="請輸入維護提示..." />
              </div>

              {/* 🚀 維護時長 (從開始維護算起) */}
              <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                <label className="block text-sm text-gray-400 mb-3 font-bold">預計維護時長 (從開始維護算起)</label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { label: '年', value: mYears, setter: setMYears }, { label: '月', value: mMonths, setter: setMMonths },
                    { label: '日', value: mDays, setter: setMDays }, { label: '時', value: mHours, setter: setMHours },
                    { label: '分', value: mMinutes, setter: setMMinutes }, { label: '秒', value: mSeconds, setter: setMSeconds }
                  ].map((f, i) => (
                    <div key={i} className="flex flex-col">
                      <label className="text-xs text-gray-500 mb-1 text-center">{f.label}</label>
                      <input type="number" min="0" placeholder="0" className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-center" value={f.value === 0 ? '' : f.value} onChange={(e) => f.setter(Number(e.target.value) || 0)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <input type="checkbox" className="w-5 h-5 accent-yellow-500" checked={siteSettings.maintenance_pre_warning} onChange={(e) => setSiteSettings({...siteSettings, maintenance_pre_warning: e.target.checked})} />
                <span className="text-sm text-yellow-400 font-bold">開啟提前預警公告 (會在 5分/3分/1分/30秒 提醒)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700/50">
              <button onClick={() => setShowMaintenanceModal(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition">取消</button>
              <button onClick={handleStartMaintenance} className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-[0_0_15px_rgba(255,0,0,0.4)]">🚀 確認啟動</button>
            </div>
          </div>
        </div>
      )}

      {/* 左側邊欄 */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800"><h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><img src="/logo.png" alt="Logo" className="h-6" /> 控制台</h2></div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'dashboard' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>📊 數據總覽</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'users' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>👥 用戶管理</button>
          <button onClick={() => setActiveTab('games')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'games' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>🎮 遊戲管理</button>
          <button onClick={() => setActiveTab('global')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'global' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>⚙️ 系統與全站</button>
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="text-red-400 hover:text-red-300 mb-3 flex items-center gap-2 w-full">🚪 登出後台</button>
          <Link href="/" className="text-gray-500 hover:text-white flex items-center gap-2">🔙 返回前台</Link>
        </div>
      </div>

      {/* 右側主要內容 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-900">
        <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-8">
          <div className="text-gray-400 capitalize">{activeTab}</div>
          <div className="flex items-center gap-4"><span className="text-sm text-gray-300">👑 管理員</span><div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold">L</div></div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
             <div className="grid grid-cols-2 gap-4"><div className="bg-gray-800 p-6 rounded-xl border border-gray-700"><div className="text-gray-400 text-sm mb-2">總用戶數</div><div className="text-3xl font-bold text-cyan-400">{users.length}</div></div><div className="bg-gray-800 p-6 rounded-xl border border-gray-700"><div className="text-gray-400 text-sm mb-2">總遊戲數</div><div className="text-3xl font-bold text-purple-400">{games.length}</div></div></div>
          )}
          {activeTab === 'users' && (
             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6"><table className="w-full text-left text-sm text-gray-400"><tbody>{users.map((user) => (<tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-4 py-3 font-mono text-cyan-400">{user.uid}</td><td className="px-4 py-3 text-white font-medium">{user.username}</td><td className="px-4 py-3"><button onClick={() => setDrawerUser(user)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs">⚙️ 管理</button></td></tr>))}</tbody></table></div>
          )}
          {activeTab === 'games' && (
             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6"><table className="w-full text-left text-sm text-gray-400"><tbody>{games.map((game) => (<tr key={game.id} className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-4 py-3 text-white font-medium">{game.title}</td><td className="px-4 py-3"><button onClick={() => setDrawerGame(game)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs">⚙️ 管理</button></td></tr>))}</tbody></table></div>
          )}

          {activeTab === 'global' && (
            <div className="max-w-6xl space-y-8">
              <h1 className="text-2xl font-bold mb-6">系統與全站控制</h1>

              <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 relative shadow-2xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">📢 全站跑馬燈設定</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">公告文字內容 (加寬)</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white text-lg" placeholder="輸入跑馬燈文字..." value={siteSettings.announcement_text} onChange={(e) => setSiteSettings({...siteSettings, announcement_text: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">文字顏色</label>
                    <input type="color" className="w-full h-14 bg-gray-900 border border-gray-700 rounded-lg p-1 cursor-pointer" value={siteSettings.announcement_text_color} onChange={(e) => setSiteSettings({...siteSettings, announcement_text_color: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">背景顏色</label>
                    <input type="color" className="w-full h-14 bg-gray-900 border border-gray-700 rounded-lg p-1 cursor-pointer" value={siteSettings.announcement_bg_color} onChange={(e) => setSiteSettings({...siteSettings, announcement_bg_color: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">滾動速度</label>
                    <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" value={siteSettings.announcement_speed} onChange={(e) => setSiteSettings({...siteSettings, announcement_speed: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">滾動方向</label>
                    <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" value={siteSettings.announcement_direction} onChange={(e) => setSiteSettings({...siteSettings, announcement_direction: e.target.value})}>
                      <option value="left">⬅️ 由右至左</option>
                      <option value="right">➡️ 由左至右</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-700/50">
                  <button onClick={handleSaveMarquee} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl transition">🚀 發布跑馬燈</button>
                </div>
              </div>

              <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 relative shadow-2xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">🛑 全站維護控制台</h2>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">準備好要進行維護了嗎？</h3>
                    <p className="text-sm text-gray-400">點擊右側按鈕將會彈出設定視窗，並在倒數後強制所有玩家進入維護狀態。</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={handleStopMaintenance} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition whitespace-nowrap">結束維護 / 取消排程</button>
                    <button onClick={() => setShowMaintenanceModal(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition whitespace-nowrap shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.6)]">🚀 啟動全站維護</button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 shadow-2xl">
                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2">💰 全服發放金幣</h2>
                 <div className="flex flex-col gap-4">
                   <div className="flex gap-3">
                     <input type="number" className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white" placeholder="輸入數量..." value={globalCoins} onChange={(e) => setGlobalCoins(Number(e.target.value))} />
                     <button onClick={handleGlobalCoins} disabled={isGloballyUpdating} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 rounded-xl transition">{isGloballyUpdating ? '發放中...' : '全服發送'}</button>
                   </div>
                   <label className="flex items-center gap-3 cursor-pointer bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                     <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={notifyCoins} onChange={(e) => setNotifyCoins(e.target.checked)} />
                     <span className="text-sm text-gray-300">發放後自動發布全站跑馬燈公告（並將背景改為金色）</span>
                   </label>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}