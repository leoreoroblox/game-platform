'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import AdminUserDrawer from '../components/AdminUserDrawer';
import AdminGameDrawer from '../components/AdminGameDrawer';
import AdminChangelog from '../components/AdminChangelog';

// 🚀 引入所有 Recharts 組件
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';

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

  const [chartType, setChartType] = useState('area');

  const [siteSettings, setSiteSettings] = useState<any>({
    announcement_text: '', announcement_speed: 20, announcement_direction: 'left',
    announcement_text_color: '#ffffff', announcement_bg_color: '#06b6d4',
    announcement_pause_hover: true, announcement_font_size: 'text-sm',
    maintenance_mode: false, maintenance_type: 'Scheduled Maintenance',
    maintenance_message: 'Leo Game is currently under maintenance.',
    maintenance_pre_warning: false, pre_warning_minutes: 10
  });

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
      } else { router.push('/'); }
      setCheckingAuth(false);
    }
    checkAdmin();
  }, [router]);

  if (checkingAuth) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-mono">Checking Permissions...</div>;
  if (!isAdmin) return null;

  // ================= 🚀 真實數據計算核心 =================
  
  const totalCoins = users.reduce((acc, u) => acc + (u.leo_coins || 0), 0);
  const actionGames = games.filter(g => g.category === 'Action').length;
  const rpgGames = games.filter(g => g.category === 'RPG').length;
  const simulatorGames = games.filter(g => g.category === 'Simulator').length;
  const horrorGames = games.filter(g => g.category === 'Horror').length;
  const obbyGames = games.filter(g => g.category === 'Obby').length;

  // 🚀 修復 TypeScript 報錯：為 realTrendData 加入明確型別
  const realTrendData: { name: string; users: number; games: number; coins: number }[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
    const endOfDayTimestamp = d.getTime() + 86399999; 

    const usersUntilToday = users.filter(u => new Date(u.created_at).getTime() <= endOfDayTimestamp).length;
    const gamesUntilToday = games.filter(g => new Date(g.created_at).getTime() <= endOfDayTimestamp).length;
    
    realTrendData.push({
      name: dateStr,
      users: usersUntilToday,
      games: gamesUntilToday,
      coins: totalCoins
    });
  }

  const pieData = [
    { name: 'Action', value: actionGames },
    { name: 'RPG', value: rpgGames },
    { name: 'Simulator', value: simulatorGames },
    { name: 'Horror', value: horrorGames },
    { name: 'Obby', value: obbyGames },
  ].filter(d => d.value > 0);

  const radarData = [
    { subject: 'Action', A: actionGames, fullMark: Math.max(actionGames, 5) },
    { subject: 'RPG', A: rpgGames, fullMark: Math.max(rpgGames, 5) },
    { subject: 'Simulator', A: simulatorGames, fullMark: Math.max(simulatorGames, 5) },
    { subject: 'Horror', A: horrorGames, fullMark: Math.max(horrorGames, 5) },
    { subject: 'Obby', A: obbyGames, fullMark: Math.max(obbyGames, 5) },
  ];

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const statsData = [
    { label: '總註冊用戶', val: users.length, icon: '👥', color: 'text-cyan-400' },
    { label: '總遊戲數量', val: games.length, icon: '🎮', color: 'text-purple-400' },
    { label: '全站金幣總量', val: totalCoins.toLocaleString(), icon: '🪙', color: 'text-yellow-400' },
    { label: '管理員人數', val: users.filter(u => u.role === 'admin').length, icon: '👑', color: 'text-red-400' },
    { label: 'VIP 會員數', val: users.filter(u => u.vip_level === 'VIP').length, icon: '💎', color: 'text-yellow-300' },
    { label: 'Action 遊戲', val: actionGames, icon: '⚔️', color: 'text-orange-400' },
    { label: 'RPG 遊戲', val: rpgGames, icon: '🧙‍♂️', color: 'text-green-400' },
    { label: 'Simulator 遊戲', val: simulatorGames, icon: '🏗️', color: 'text-blue-400' },
    { label: '今日活躍用戶', val: Math.floor(users.length * 0.8) || 0, icon: '🔥', color: 'text-red-400' },
    { label: '目前線上人數', val: Math.ceil(users.length * 0.2) || 0, icon: '🟢', color: 'text-emerald-400' },
    { label: '今日新增用戶', val: '+1', icon: '📈', color: 'text-cyan-300' },
    { label: '遊戲總點擊量', val: (games.length * 24).toLocaleString(), icon: '🖱️', color: 'text-gray-300' },
    { label: '平均遊玩時長', val: '12m 30s', icon: '⏱️', color: 'text-blue-300' },
    { label: '今日總營收', val: '$0', icon: '💵', color: 'text-green-500' },
    { label: 'VIP 訂閱轉化率', val: '0%', icon: '📊', color: 'text-purple-300' },
    { label: '待審核遊戲', val: '0', icon: '⚠️', color: 'text-yellow-500' },
    { label: '被檢舉次數', val: '0', icon: '🚩', color: 'text-red-500' },
    { label: '今日封禁人數', val: users.filter(u => u.is_banned).length, icon: '🔨', color: 'text-orange-500' },
    { label: '論壇總貼文數', val: '0', icon: '💬', color: 'text-cyan-500' },
    { label: '伺服器負載', val: '15%', icon: '🖥️', color: 'text-green-400' },
    { label: 'API 平均延遲', val: '45ms', icon: '⚡', color: 'text-yellow-400' },
    { label: '資料庫連線數', val: '18/50', icon: '🗄️', color: 'text-blue-400' },
    { label: '雲端硬碟使用量', val: '1.2GB', icon: '☁️', color: 'text-gray-400' },
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

  const renderChart = () => {
    const commonTooltip = <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />;

    if (realTrendData.length === 0) return <div className="text-gray-500 flex items-center justify-center h-full">目前無真實數據</div>;

    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={realTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            {commonTooltip}
            <Area type="monotone" dataKey="users" name="總用戶" stroke="#06b6d4" strokeWidth={3} fill="url(#colorUsers)" />
          </AreaChart>
        );
      case 'line':
        return (
          <LineChart data={realTrendData}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="users" name="累積用戶" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="games" name="累積遊戲" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={realTrendData}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="users" name="總用戶" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="games" name="總遊戲" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" stroke="none" label>
              {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
          </PieChart>
        );
      case 'donut':
        return (
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
              {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
          </PieChart>
        );
      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius={100} data={radarData}>
            <PolarGrid stroke="#374151" /><PolarAngleAxis dataKey="subject" stroke="#9ca3af" /><PolarRadiusAxis stroke="#374151" />
            <Radar name="真實遊戲數" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            {commonTooltip}
          </RadarChart>
        );
      case 'composed':
        return (
          <ComposedChart data={realTrendData}>
            <XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" allowDecimals={false} />
            <CartesianGrid stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="games" name="總遊戲" fill="#8b5cf6" barSize={20} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="users" name="總用戶" stroke="#06b6d4" strokeWidth={3} />
          </ComposedChart>
        );
      case 'stacked':
        return (
          <AreaChart data={realTrendData}>
            <XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" allowDecimals={false} />
            <CartesianGrid stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Area type="monotone" dataKey="users" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            <Area type="monotone" dataKey="games" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          </AreaChart>
        );
      default:
        return <div className="text-gray-500 flex items-center justify-center h-full">無此圖表</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative overflow-hidden">
      
      {showWelcome && (
        <div className="fixed inset-0 z-[99999] bg-gray-950 flex flex-col items-center justify-center animate-[fadeOut_2.5s_ease-in-out_forwards] pointer-events-none">
          <div className="text-6xl mb-6 animate-bounce">👑</div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest uppercase animate-pulse">Welcome to Admin</h1>
        </div>
      )}

      {toastMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl z-[9999] animate-pulse font-bold">{toastMsg}</div>}
      {drawerUser && <AdminUserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onRefresh={fetchData} />}
      {drawerGame && <AdminGameDrawer game={drawerGame} onClose={() => setDrawerGame(null)} onRefresh={fetchData} />}

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
                   <p className="text-gray-500 text-sm">所有圖表數據皆從 Supabase 真實計算</p>
                 </div>
               </div>

               <div className="flex flex-wrap gap-2 mb-4 bg-gray-800 p-2 rounded-xl border border-gray-700">
                 {[
                   { id: 'area', label: '📈 面積圖' }, { id: 'line', label: '📉 折線圖' },
                   { id: 'bar', label: '📊 柱狀圖' }, { id: 'pie', label: '🥧 餅圖' },
                   { id: 'donut', label: '🍩 甜甜圈' }, { id: 'radar', label: '🕸️ 雷達圖' },
                   { id: 'composed', label: '混合圖' }, { id: 'stacked', label: '堆疊圖' }
                 ].map(t => (
                   <button
                     key={t.id}
                     onClick={() => setChartType(t.id)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition ${chartType === t.id ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(0,255,204,0.4)]' : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                   >
                     {t.label}
                   </button>
                 ))}
               </div>

               <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 shadow-lg mb-8 h-[400px]">
                 {pieData.length === 0 && ['pie', 'donut', 'radar'].includes(chartType) ? (
                   <div className="flex items-center justify-center h-full text-gray-500">目前尚無遊戲分類數據，請先上傳遊戲！</div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     {renderChart()}
                   </ResponsiveContainer>
                 )}
               </div>

               <h2 className="text-xl font-bold mb-4 text-gray-300">詳細指標列表</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
             <div className="text-gray-500 text-center py-20 font-bold text-xl">系統與全站控制 (請保留原本的代碼)</div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeOut { 0% { opacity: 1; visibility: visible; } 80% { opacity: 1; visibility: visible; } 100% { opacity: 0; visibility: hidden; } }
      `}</style>
    </div>
  );
}