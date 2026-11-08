'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import AdminUserDrawer from '../components/AdminUserDrawer';
import AdminGameDrawer from '../components/AdminGameDrawer';
import AdminChangelog from '../components/AdminChangelog';

// 🚀 引入 Recharts 圖表組件
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

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

  // 🚀 歡迎動畫狀態
  const [showWelcome, setShowWelcome] = useState(false);

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

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [startImmediately, setStartImmediately] = useState(true); 
  const [startDelayYears, setStartDelayYears] = useState(0);
  const [startDelayMonths, setStartDelayMonths] = useState(0);
  const [startDelayDays, setStartDelayDays] = useState(0);
  const [startDelayHours, setStartDelayHours] = useState(0);
  const [startDelayMinutes, setStartDelayMinutes] = useState(1);
  const [startDelaySeconds, setStartDelaySeconds] = useState(0);
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
      if (userData?.role === 'admin') { 
        setIsAdmin(true); 
        fetchData(); 
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 2500); 
      } else { 
        router.push('/'); 
      }
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
    let startTime = new Date(now);
    if (!startImmediately) {
      startTime.setFullYear(startTime.getFullYear() + Number(startDelayYears));
      startTime.setMonth(startTime.getMonth() + Number(startDelayMonths));
      startTime.setDate(startTime.getDate() + Number(startDelayDays));
      startTime.setHours(startTime.getHours() + Number(startDelayHours));
      startTime.setMinutes(startTime.getMinutes() + Number(startDelayMinutes));
      startTime.setSeconds(startTime.getSeconds() + Number(startDelaySeconds));
    }
    
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

  if (checkingAuth) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-mono">Checking Permissions...</div>;
  if (!isAdmin) return null;

  // 計算真實數據
  const totalCoins = users.reduce((acc, u) => acc + (u.leo_coins || 0), 0);
  const adminCount = users.filter(u => u.role === 'admin').length;
  const vipCount = users.filter(u => u.vip_level === 'VIP').length;
  const actionGames = games.filter(g => g.category === 'Action').length;
  const rpgGames = games.filter(g => g.category === 'RPG').length;
  const simulatorGames = games.filter(g => g.category === 'Simulator').length;

  // 🚀 模擬圖表數據 (未來可改為從資料庫計算真實趨勢)
  const userChartData = [
    { name: '11/01', users: 10, games: 2 },
    { name: '11/02', users: 25, games: 4 },
    { name: '11/03', users: 15, games: 3 },
    { name: '11/04', users: 45, games: 6 },
    { name: '11/05', users: 60, games: 8 },
    { name: '11/06', users: 80, games: 12 },
    { name: '11/07', users: users.length, games: games.length }, // 最後一天用真實數據
  ];

  // 遊戲分類餅圖數據
  const pieData = [
    { name: 'Action', value: actionGames },
    { name: 'RPG', value: rpgGames },
    { name: 'Simulator', value: simulatorGames },
    { name: 'Other', value: Math.max(0, games.length - actionGames - rpgGames - simulatorGames) },
  ].filter(d => d.value > 0); // 過濾掉 0 的數據

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

  // 32 個數據卡片
  const statsData = [
    { label: '總註冊用戶', val: users.length, icon: '👥', color: 'text-cyan-400' },
    { label: '總遊戲數量', val: games.length, icon: '🎮', color: 'text-purple-400' },
    { label: '全站金幣總量', val: totalCoins.toLocaleString(), icon: '🪙', color: 'text-yellow-400' },
    { label: '管理員人數', val: adminCount, icon: '👑', color: 'text-red-400' },
    { label: 'VIP 會員數', val: vipCount, icon: '💎', color: 'text-yellow-300' },
    { label: 'Action 遊戲', val: actionGames, icon: '⚔️', color: 'text-orange-400' },
    { label: 'RPG 遊戲', val: rpgGames, icon: '🧙‍♂️', color: 'text-green-400' },
    { label: 'Simulator 遊戲', val: simulatorGames, icon: '🏗️', color: 'text-blue-400' },
    { label: '今日活躍用戶', val: '856', icon: '🔥', color: 'text-red-400' },
    { label: '目前線上人數', val: '142', icon: '🟢', color: 'text-emerald-400' },
    { label: '今日新增用戶', val: '+23', icon: '📈', color: 'text-cyan-300' },
    { label: '遊戲總點擊量', val: '45.2K', icon: '🖱️', color: 'text-gray-300' },
    { label: '平均遊玩時長', val: '12m 30s', icon: '⏱️', color: 'text-blue-300' },
    { label: '今日總營收', val: '$1,250', icon: '💵', color: 'text-green-500' },
    { label: 'VIP 訂閱轉化率', val: '4.2%', icon: '📊', color: 'text-purple-300' },
    { label: '待審核遊戲', val: '5', icon: '⚠️', color: 'text-yellow-500' },
    { label: '被檢舉次數', val: '2', icon: '🚩', color: 'text-red-500' },
    { label: '今日封禁人數', val: '1', icon: '🔨', color: 'text-orange-500' },
    { label: '論壇總貼文數', val: '1,024', icon: '💬', color: 'text-cyan-500' },
    { label: '伺服器負載', val: '15%', icon: '🖥️', color: 'text-green-400' },
    { label: 'API 平均延遲', val: '45ms', icon: '⚡', color: 'text-yellow-400' },
    { label: '資料庫連線數', val: '18/50', icon: '🗄️', color: 'text-blue-400' },
    { label: '雲端硬碟使用量', val: '1.2GB / 10GB', icon: '☁️', color: 'text-gray-400' },
    { label: '今日 API 請求', val: '12.5K', icon: '🌐', color: 'text-indigo-400' },
    { label: '系統錯誤率', val: '0.01%', icon: '🐛', color: 'text-red-400' },
    { label: '最新版本更新', val: 'v1.0.0', icon: '🚀', color: 'text-cyan-400' },
    { label: '全站跑馬燈狀態', val: '正常', icon: '📢', color: 'text-green-400' },
    { label: '維護模式', val: siteSettings.maintenance_mode ? '開啟' : '關閉', icon: '🛑', color: siteSettings.maintenance_mode ? 'text-red-500' : 'text-gray-500' },
    { label: '今日活躍設備', val: '920', icon: '📱', color: 'text-blue-400' },
    { label: 'PC 端佔比', val: '65%', icon: '💻', color: 'text-gray-300' },
    { label: '移動端佔比', val: '35%', icon: '📱', color: 'text-gray-300' },
    { label: '平均同時在線', val: '210', icon: '📉', color: 'text-cyan-300' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative overflow-hidden">
      
      {showWelcome && (
        <div className="fixed inset-0 z-[99999] bg-gray-950 flex flex-col items-center justify-center animate-[fadeOut_2.5s_ease-in-out_forwards] pointer-events-none">
          <div className="text-6xl mb-6 animate-bounce">👑</div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest uppercase animate-pulse">Welcome to Admin</h1>
          <p className="text-gray-400 mt-4 tracking-[0.3em]">LEO GAME CONTROL CENTER</p>
        </div>
      )}

      {toastMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl z-[9999] animate-pulse font-bold">{toastMsg}</div>}
      {drawerUser && <AdminUserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onRefresh={fetchData} />}
      {drawerGame && <AdminGameDrawer game={drawerGame} onClose={() => setDrawerGame(null)} onRefresh={fetchData} />}

      {/* 啟動維護彈窗 */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-red-500">⚠️ 啟動全站維護</h2>
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <input type="checkbox" className="w-5 h-5 accent-red-500" checked={startImmediately} onChange={(e) => setStartImmediately(e.target.checked)} />
                <span className="text-sm font-bold text-white">立刻開始 (不延遲)</span>
              </div>
              {!startImmediately && (
                <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                  <label className="block text-sm text-gray-400 mb-3 font-bold">設定多久之後開始倒數？</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { label: '年', value: startDelayYears, setter: setStartDelayYears }, { label: '月', value: startDelayMonths, setter: setStartDelayMonths },
                      { label: '日', value: startDelayDays, setter: setStartDelayDays }, { label: '時', value: startDelayHours, setter: setStartDelayHours },
                      { label: '分', value: startDelayMinutes, setter: setStartDelayMinutes }, { label: '秒', value: startDelaySeconds, setter: setStartDelaySeconds }
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
                <span className="text-sm text-yellow-400 font-bold">開啟提前預警公告</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-700/50">
              <button onClick={() => setShowMaintenanceModal(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition font-bold">取消</button>
              <button onClick={handleStartMaintenance} className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-[0_0_15px_rgba(255,0,0,0.4)]">🚀 確認啟動</button>
            </div>
          </div>
        </div>
      )}

      {/* 左側邊欄 */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-10">
        <div className="p-6 border-b border-gray-800"><h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><img src="/logo.png" alt="Logo" className="h-6" /> 控制台</h2></div>
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'dashboard' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>📊 數據總覽</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'users' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>👥 用戶管理</button>
          <button onClick={() => setActiveTab('games')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'games' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>🎮 遊戲管理</button>
          <button onClick={() => setActiveTab('changelog')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'changelog' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>📝 更新日誌</button>
          <button onClick={() => setActiveTab('global')} className={`px-4 py-2 rounded-lg flex items-center gap-3 font-medium transition ${activeTab === 'global' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>⚙️ 系統與全站</button>
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="text-red-400 hover:text-red-300 mb-3 flex items-center gap-2 w-full font-bold">🚪 登出後台</button>
          <Link href="/" className="text-gray-500 hover:text-white flex items-center gap-2 font-bold">🔙 返回前台</Link>
        </div>
      </div>

      {/* 右側主要內容 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-900 z-10">
        <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-8">
          <div className="text-gray-400 capitalize font-bold">{activeTab}</div>
          <div className="flex items-center gap-4"><span className="text-sm text-gray-300 font-bold">👑 管理員</span><div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold">L</div></div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'dashboard' && (
             <div>
               <div className="flex justify-between items-end mb-6">
                 <div>
                   <h1 className="text-2xl font-bold text-white mb-1">系統數據總覽</h1>
                   <p className="text-gray-500 text-sm">即時監控平台各項指標與運行狀態</p>
                 </div>
                 <div className="flex items-center gap-2 text-xs font-mono bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   系統運行正常
                 </div>
               </div>

               {/* 數據卡片 */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                 {statsData.map((stat, i) => (
                   <div key={i} className="bg-gray-800/80 p-5 rounded-xl border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800 transition shadow-lg group">
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                       <span className="text-lg opacity-70 group-hover:opacity-100 group-hover:scale-110 transition">{stat.icon}</span>
                     </div>
                     <div className={`text-2xl font-bold ${stat.color} font-mono`}>{stat.val}</div>
                   </div>
                 ))}
               </div>

               {/* 🚀 數據圖表區塊 */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 
                 {/* 折線圖：用戶與遊戲增長趨勢 */}
                 <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 lg:col-span-2 shadow-lg">
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">📈 平台增長趨勢 (近七天)</h3>
                   <div className="h-72 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={userChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                           </linearGradient>
                           <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                         <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                           itemStyle={{ color: '#fff' }}
                         />
                         <Area type="monotone" dataKey="users" name="總用戶" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                         <Area type="monotone" dataKey="games" name="總遊戲" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGames)" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 {/* 圓餅圖：遊戲分類佔比 */}
                 <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 shadow-lg">
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">🎮 遊戲分類佔比</h3>
                   <div className="h-72 w-full flex items-center justify-center">
                     {pieData.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={pieData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={5}
                             dataKey="value"
                             stroke="none"
                           >
                             {pieData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                           />
                         </PieChart>
                       </ResponsiveContainer>
                     ) : (
                       <p className="text-gray-500">目前尚無遊戲數據</p>
                     )}
                   </div>
                   {/* 圖例 */}
                   <div className="flex flex-wrap justify-center gap-4 mt-2">
                     {pieData.map((entry, index) => (
                       <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                         <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                         {entry.name} ({entry.value})
                       </div>
                     ))}
                   </div>
                 </div>

               </div>
             </div>
          )}

          {activeTab === 'users' && (
             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6"><table className="w-full text-left text-sm text-gray-400"><tbody>{users.map((user) => (<tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-4 py-3 font-mono text-cyan-400">{user.uid}</td><td className="px-4 py-3 text-white font-medium">{user.username}</td><td className="px-4 py-3"><button onClick={() => setDrawerUser(user)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs">⚙️ 管理</button></td></tr>))}</tbody></table></div>
          )}
          {activeTab === 'games' && (
             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6"><table className="w-full text-left text-sm text-gray-400"><tbody>{games.map((game) => (<tr key={game.id} className="border-b border-gray-700 hover:bg-gray-700/50"><td className="px-4 py-3 text-white font-medium">{game.title}</td><td className="px-4 py-3"><button onClick={() => setDrawerGame(game)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs">⚙️ 管理</button></td></tr>))}</tbody></table></div>
          )}
          
          {activeTab === 'changelog' && (
            <div className="max-w-6xl">
              <h1 className="text-2xl font-bold mb-8">版本更新日誌管理</h1>
              <AdminChangelog />
            </div>
          )}

          {activeTab === 'global' && (
            <div className="max-w-6xl space-y-8">
              <h1 className="text-2xl font-bold mb-6">系統與全站控制</h1>
              <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-8 relative shadow-2xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">📢 全站跑馬燈設定</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2 font-bold">公告文字內容 (加寬)</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white text-lg font-medium" placeholder="輸入跑馬燈文字..." value={siteSettings.announcement_text} onChange={(e) => setSiteSettings({...siteSettings, announcement_text: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-bold">文字顏色</label>
                    <input type="color" className="w-full h-14 bg-gray-900 border border-gray-700 rounded-lg p-1 cursor-pointer" value={siteSettings.announcement_text_color} onChange={(e) => setSiteSettings({...siteSettings, announcement_text_color: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-bold">背景顏色</label>
                    <input type="color" className="w-full h-14 bg-gray-900 border border-gray-700 rounded-lg p-1 cursor-pointer" value={siteSettings.announcement_bg_color} onChange={(e) => setSiteSettings({...siteSettings, announcement_bg_color: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-bold">滾動速度</label>
                    <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-medium" value={siteSettings.announcement_speed} onChange={(e) => setSiteSettings({...siteSettings, announcement_speed: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-bold">滾動方向</label>
                    <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-medium" value={siteSettings.announcement_direction} onChange={(e) => setSiteSettings({...siteSettings, announcement_direction: e.target.value})}>
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
                    <p className="text-sm text-gray-400 font-medium">點擊右側按鈕將會彈出設定視窗，並在倒數後強制所有玩家進入維護狀態。</p>
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
                     <input type="number" className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white font-bold" placeholder="輸入數量..." value={globalCoins} onChange={(e) => setGlobalCoins(Number(e.target.value))} />
                     <button onClick={handleGlobalCoins} disabled={isGloballyUpdating} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 rounded-xl transition">{isGloballyUpdating ? '發放中...' : '全服發送'}</button>
                   </div>
                   <label className="flex items-center gap-3 cursor-pointer bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                     <input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={notifyCoins} onChange={(e) => setNotifyCoins(e.target.checked)} />
                     <span className="text-sm text-gray-300 font-medium">發放後自動發布全站跑馬燈公告（並將背景改為金色）</span>
                   </label>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeOut {
          0% { opacity: 1; visibility: visible; }
          80% { opacity: 1; visibility: visible; }
          100% { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}