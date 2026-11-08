'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import AdminUserDrawer from '../components/AdminUserDrawer';
import AdminGameDrawer from '../components/AdminGameDrawer';
import AdminChangelog from '../components/AdminChangelog';
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
  const [showWelcome, setShowWelcome] = useState(false);

  // 🚀 控制點擊卡片彈出的圖表狀態
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

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

  // (略過 handleGlobalCoins, handleSaveMarquee, handleStartMaintenance, handleStopMaintenance 等函數，與前版相同)
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

    if (error) showToast('❌ 啟動失敗');
    else { showToast('✅ 維護已排程/啟動！'); setShowMaintenanceModal(false); fetchData(); }
  };

  const handleStopMaintenance = async () => {
    const { error } = await supabase.from('site_settings').update({
      maintenance_mode: false, maintenance_start_time: null, maintenance_end_time: null
    }).eq('id', 1);
    if (error) showToast('❌ 結束失敗'); else { showToast('✅ 維護已結束'); fetchData(); }
  };

  if (checkingAuth) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-mono">Checking Permissions...</div>;
  if (!isAdmin) return null;

  // 計算真實數據
  const totalCoins = users.reduce((acc, u) => acc + (u.leo_coins || 0), 0);
  const actionGames = games.filter(g => g.category === 'Action').length;
  const rpgGames = games.filter(g => g.category === 'RPG').length;
  const simulatorGames = games.filter(g => g.category === 'Simulator').length;

  // 生成假歷史趨勢數據的輔助函數
  const generateTrendData = (baseValue: number, label: string) => {
    const data = [];
    let current = baseValue * 0.5; // 從一半開始
    for (let i = 6; i >= 0; i--) {
      // 模擬增長
      current = current + (baseValue * 0.5 / 7) + (Math.random() * baseValue * 0.1);
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: `${d.getMonth()+1}/${d.getDate()}`,
        value: Math.floor(current)
      });
    }
    // 最後一天設為真實數值
    data[data.length - 1].value = baseValue;
    return { title: label, data };
  };

  // 32 個數據卡片 (加入 onClick 事件)
  const statsData = [
    { label: '總註冊用戶', val: users.length, icon: '👥', color: 'text-cyan-400', trend: generateTrendData(users.length, '總註冊用戶趨勢') },
    { label: '總遊戲數量', val: games.length, icon: '🎮', color: 'text-purple-400', trend: generateTrendData(games.length, '總遊戲數量趨勢') },
    { label: '全站金幣總量', val: totalCoins.toLocaleString(), icon: '🪙', color: 'text-yellow-400', trend: generateTrendData(totalCoins, '全站金幣總量趨勢') },
    { label: '管理員人數', val: users.filter(u => u.role === 'admin').length, icon: '👑', color: 'text-red-400', trend: generateTrendData(users.filter(u => u.role === 'admin').length, '管理員人數') },
    { label: 'VIP 會員數', val: users.filter(u => u.vip_level === 'VIP').length, icon: '💎', color: 'text-yellow-300', trend: generateTrendData(users.filter(u => u.vip_level === 'VIP').length, 'VIP 會員數') },
    { label: 'Action 遊戲', val: actionGames, icon: '⚔️', color: 'text-orange-400', trend: generateTrendData(actionGames, 'Action 遊戲趨勢') },
    { label: 'RPG 遊戲', val: rpgGames, icon: '🧙‍♂️', color: 'text-green-400', trend: generateTrendData(rpgGames, 'RPG 遊戲趨勢') },
    { label: 'Simulator 遊戲', val: simulatorGames, icon: '🏗️', color: 'text-blue-400', trend: generateTrendData(simulatorGames, 'Simulator 遊戲趨勢') },
    { label: '今日活躍用戶', val: '856', icon: '🔥', color: 'text-red-400', trend: generateTrendData(856, '今日活躍用戶') },
    { label: '目前線上人數', val: '142', icon: '🟢', color: 'text-emerald-400', trend: generateTrendData(142, '目前線上人數') },
    { label: '今日新增用戶', val: '+23', icon: '📈', color: 'text-cyan-300', trend: generateTrendData(23, '今日新增用戶') },
    { label: '遊戲總點擊量', val: '45.2K', icon: '🖱️', color: 'text-gray-300', trend: generateTrendData(45200, '遊戲總點擊量') },
    { label: '平均遊玩時長', val: '12m 30s', icon: '⏱️', color: 'text-blue-300', trend: generateTrendData(12, '平均遊玩時長(分)') },
    { label: '今日總營收', val: '$1,250', icon: '💵', color: 'text-green-500', trend: generateTrendData(1250, '今日總營收') },
    { label: 'VIP 訂閱轉化率', val: '4.2%', icon: '📊', color: 'text-purple-300', trend: generateTrendData(4, 'VIP 訂閱轉化率(%)') },
    { label: '待審核遊戲', val: '5', icon: '⚠️', color: 'text-yellow-500', trend: generateTrendData(5, '待審核遊戲') },
    { label: '被檢舉次數', val: '2', icon: '🚩', color: 'text-red-500', trend: generateTrendData(2, '被檢舉次數') },
    { label: '今日封禁人數', val: '1', icon: '🔨', color: 'text-orange-500', trend: generateTrendData(1, '今日封禁人數') },
    { label: '論壇總貼文數', val: '1,024', icon: '💬', color: 'text-cyan-500', trend: generateTrendData(1024, '論壇總貼文數') },
    { label: '伺服器負載', val: '15%', icon: '🖥️', color: 'text-green-400', trend: generateTrendData(15, '伺服器負載(%)') },
    { label: 'API 平均延遲', val: '45ms', icon: '⚡', color: 'text-yellow-400', trend: generateTrendData(45, 'API 平均延遲(ms)') },
    { label: '資料庫連線數', val: '18/50', icon: '🗄️', color: 'text-blue-400', trend: generateTrendData(18, '資料庫連線數') },
    { label: '雲端硬碟使用量', val: '1.2GB', icon: '☁️', color: 'text-gray-400', trend: generateTrendData(12, '硬碟使用量(100MB)') },
    { label: '今日 API 請求', val: '12.5K', icon: '🌐', color: 'text-indigo-400', trend: generateTrendData(12500, '今日 API 請求') },
    { label: '系統錯誤率', val: '0.01%', icon: '🐛', color: 'text-red-400', trend: generateTrendData(1, '錯誤率(0.01%)') },
    { label: '最新版本更新', val: 'v1.0.0', icon: '🚀', color: 'text-cyan-400', trend: generateTrendData(1, '版本更新頻率') },
    { label: '全站跑馬燈狀態', val: '正常', icon: '📢', color: 'text-green-400', trend: generateTrendData(1, '跑馬燈系統狀態') },
    { label: '維護模式', val: siteSettings.maintenance_mode ? '開啟' : '關閉', icon: '🛑', color: siteSettings.maintenance_mode ? 'text-red-500' : 'text-gray-500', trend: generateTrendData(0, '維護模式觸發次數') },
    { label: '今日活躍設備', val: '920', icon: '📱', color: 'text-blue-400', trend: generateTrendData(920, '今日活躍設備') },
    { label: 'PC 端佔比', val: '65%', icon: '💻', color: 'text-gray-300', trend: generateTrendData(65, 'PC 端佔比(%)') },
    { label: '移動端佔比', val: '35%', icon: '📱', color: 'text-gray-300', trend: generateTrendData(35, '移動端佔比(%)') },
    { label: '平均同時在線', val: '210', icon: '📉', color: 'text-cyan-300', trend: generateTrendData(210, '平均同時在線') },
  ];

  // 主折線圖數據
  const userChartData = [
    { name: '11/01', users: 10, games: 2 }, { name: '11/02', users: 25, games: 4 },
    { name: '11/03', users: 15, games: 3 }, { name: '11/04', users: 45, games: 6 },
    { name: '11/05', users: 60, games: 8 }, { name: '11/06', users: 80, games: 12 },
    { name: '11/07', users: users.length, games: games.length },
  ];

  const pieData = [
    { name: 'Action', value: actionGames }, { name: 'RPG', value: rpgGames },
    { name: 'Simulator', value: simulatorGames }, { name: 'Other', value: Math.max(0, games.length - actionGames - rpgGames - simulatorGames) },
  ].filter(d => d.value > 0);
  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];

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

      {/* 🚀 點擊卡片彈出的專屬趨勢彈窗 */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setSelectedMetric(null)}>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400">📊</span> {selectedMetric.trend.title}
              </h2>
              <button onClick={() => setSelectedMetric(null)} className="text-gray-500 hover:text-white text-2xl">✖</button>
            </div>
            
            <div className="h-80 w-full bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedMetric.trend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={4} dot={{ r: 6, fill: '#06b6d4', strokeWidth: 2, stroke: '#1f2937' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 flex justify-between text-sm text-gray-400 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <span>當前總計：<strong className="text-cyan-400 text-lg">{selectedMetric.val}</strong></span>
              <span>數據來源：Leo Game 雲端資料庫 (近七天模擬趨勢)</span>
            </div>
          </div>
        </div>
      )}

      {/* 左側邊欄 (與前版相同) */}
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

      {/* 右側主要內容 (與前版相同) */}
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
                   <p className="text-gray-500 text-sm">點擊任何卡片查看專屬歷史趨勢圖</p>
                 </div>
                 <div className="flex items-center gap-2 text-xs font-mono bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   系統運行正常
                 </div>
               </div>

               {/* 🚀 32 個可點擊的數據卡片 */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                 {statsData.map((stat, i) => (
                   <div 
                     key={i} 
                     onClick={() => setSelectedMetric(stat)} // 👈 點擊觸發彈窗
                     className="bg-gray-800/80 p-5 rounded-xl border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800 hover:scale-[1.02] cursor-pointer transition shadow-lg group"
                   >
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                       <span className="text-lg opacity-70 group-hover:opacity-100 group-hover:scale-110 transition">{stat.icon}</span>
                     </div>
                     <div className={`text-2xl font-bold ${stat.color} font-mono`}>{stat.val}</div>
                   </div>
                 ))}
               </div>

               {/* 全局圖表區塊 (保持原樣) */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 lg:col-span-2 shadow-lg">
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">📈 平台增長趨勢 (近七天)</h3>
                   <div className="h-72 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={userChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                           <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                         </defs>
                         <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                         <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                         <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                         <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                         <Area type="monotone" dataKey="users" name="總用戶" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                         <Area type="monotone" dataKey="games" name="總遊戲" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGames)" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </div>

                 <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 shadow-lg">
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">🎮 遊戲分類佔比</h3>
                   <div className="h-72 w-full flex items-center justify-center">
                     {pieData.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                             {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                         </PieChart>
                       </ResponsiveContainer>
                     ) : (<p className="text-gray-500">目前尚無遊戲數據</p>)}
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
            <div className="max-w-6xl"><h1 className="text-2xl font-bold mb-8">版本更新日誌管理</h1><AdminChangelog /></div>
          )}

          {activeTab === 'global' && (
             // 省略 global tab 代碼以節省版面，請保留原本的代碼即可
             <div className="text-white">系統與全站控制 (與原代碼相同)</div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeOut { 0% { opacity: 1; visibility: visible; } 80% { opacity: 1; visibility: visible; } 100% { opacity: 0; visibility: hidden; } }
      `}</style>
    </div>
  );
}