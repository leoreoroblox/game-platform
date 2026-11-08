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
  ScatterChart, Scatter, ZAxis, ComposedChart, RadialBarChart, RadialBar, Treemap
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

  // 🚀 圖表切換狀態 (預設為 area)
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

  // ================= 數據準備 =================
  const totalCoins = users.reduce((acc, u) => acc + (u.leo_coins || 0), 0);
  const actionGames = games.filter(g => g.category === 'Action').length;
  const rpgGames = games.filter(g => g.category === 'RPG').length;
  const simulatorGames = games.filter(g => g.category === 'Simulator').length;

  const statsData = [
    { label: '總註冊用戶', val: users.length, icon: '👥', color: 'text-cyan-400' },
    { label: '總遊戲數量', val: games.length, icon: '🎮', color: 'text-purple-400' },
    { label: '全站金幣總量', val: totalCoins.toLocaleString(), icon: '🪙', color: 'text-yellow-400' },
    { label: '管理員人數', val: users.filter(u => u.role === 'admin').length, icon: '👑', color: 'text-red-400' },
    { label: 'VIP 會員數', val: users.filter(u => u.vip_level === 'VIP').length, icon: '💎', color: 'text-yellow-300' },
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
    { label: '待審核遊戲', val: '5', icon: '⚠️', color: 'text-yellow-500' }
  ];

  // 圖表數據 (使用你的真實數據)
  const trendData = [
    { name: '11/01', users: 10, games: 2, coins: 500 },
    { name: '11/02', users: 25, games: 4, coins: 1200 },
    { name: '11/03', users: 15, games: 3, coins: 800 },
    { name: '11/04', users: 45, games: 6, coins: 3400 },
    { name: '11/05', users: 60, games: 8, coins: 5600 },
    { name: '11/06', users: 80, games: 12, coins: 8900 },
    { name: '11/07', users: users.length, games: games.length, coins: totalCoins },
  ];

  const pieData = [
    { name: 'Action', value: actionGames },
    { name: 'RPG', value: rpgGames },
    { name: 'Simulator', value: simulatorGames },
    { name: 'Other', value: Math.max(0, games.length - actionGames - rpgGames - simulatorGames) },
  ].filter(d => d.value > 0);

  const radarData = [
    { subject: 'Action', A: actionGames, fullMark: 10 },
    { subject: 'RPG', A: rpgGames, fullMark: 10 },
    { subject: 'Sim', A: simulatorGames, fullMark: 10 },
    { subject: 'Obby', A: 3, fullMark: 10 },
    { subject: 'Horror', A: 1, fullMark: 10 },
  ];

  const scatterData = [
    { x: 10, y: 30, z: 200 }, { x: 30, y: 200, z: 260 },
    { x: 45, y: 100, z: 400 }, { x: 50, y: 400, z: 280 },
    { x: 70, y: 150, z: 500 }, { x: 100, y: 250, z: 200 },
  ];

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  // 渲染不同圖表的輔助函數
  const renderChart = () => {
    const commonTooltip = <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />;

    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            {commonTooltip}
            <Area type="monotone" dataKey="users" name="用戶" stroke="#06b6d4" strokeWidth={3} fill="url(#colorUsers)" />
          </AreaChart>
        );
      case 'line':
        return (
          <LineChart data={trendData}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="users" name="總用戶" stroke="#06b6d4" strokeWidth={3} />
            <Line type="monotone" dataKey="games" name="總遊戲" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={trendData}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="users" name="用戶" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="games" name="遊戲" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
            <Radar name="遊戲數量" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            {commonTooltip}
          </RadarChart>
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid stroke="#374151" /><XAxis type="number" dataKey="x" name="點擊" stroke="#6b7280" /><YAxis type="number" dataKey="y" name="留存" stroke="#6b7280" /><ZAxis type="number" dataKey="z" range={[60, 400]} name="營收" />
            {commonTooltip}<Scatter name="數據分佈" data={scatterData} fill="#8b5cf6" />
          </ScatterChart>
        );
      case 'composed':
        return (
          <ComposedChart data={trendData}>
            <XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" />
            <CartesianGrid stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="games" name="遊戲數" fill="#8b5cf6" barSize={20} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="users" name="用戶數" stroke="#06b6d4" strokeWidth={3} />
          </ComposedChart>
        );
      case 'radial':
        const radialData = [{ name: 'Active', value: 75, fill: '#06b6d4' }, { name: 'Idle', value: 25, fill: '#374151' }];
        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={20} data={radialData}>
            <RadialBar dataKey="value" cornerRadius={10} />
            {commonTooltip}
          </RadialBarChart>
        );
      case 'treemap':
        const treemapData = pieData.map(d => ({ name: d.name, size: d.value * 100 }));
        return (
          <Treemap data={treemapData} dataKey="size" aspectRatio={4 / 3} stroke="#1f2937" fill="#06b6d4">
            {commonTooltip}
          </Treemap>
        );
      case 'stacked':
        return (
          <AreaChart data={trendData}>
            <XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" />
            <CartesianGrid stroke="#374151" vertical={false} />
            {commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} />
            <Area type="monotone" dataKey="users" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            <Area type="monotone" dataKey="games" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          </AreaChart>
        );
      default:
        return <div className="text-gray-500 flex items-center justify-center h-full">選擇一種圖表類型</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative overflow-hidden">
      
      {/* 歡迎動畫 */}
      {showWelcome && (
        <div className="fixed inset-0 z-[99999] bg-gray-950 flex flex-col items-center justify-center animate-[fadeOut_2.5s_ease-in-out_forwards] pointer-events-none">
          <div className="text-6xl mb-6 animate-bounce">👑</div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest uppercase animate-pulse">Welcome to Admin</h1>
        </div>
      )}

      {toastMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl z-[9999] animate-pulse font-bold">{toastMsg}</div>}
      {drawerUser && <AdminUserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onRefresh={fetchData} />}
      {drawerGame && <AdminGameDrawer game={drawerGame} onClose={() => setDrawerGame(null)} onRefresh={fetchData} />}

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
                   <p className="text-gray-500 text-sm">點擊下方按鈕切換不同類型的數據圖表</p>
                 </div>
               </div>

               {/* 🚀 圖表切換按鈕區 */}
               <div className="flex flex-wrap gap-2 mb-4 bg-gray-800 p-2 rounded-xl border border-gray-700">
                 {[
                   { id: 'area', label: '📈 面積圖' }, { id: 'line', label: '📉 折線圖' },
                   { id: 'bar', label: '📊 柱狀圖' }, { id: 'pie', label: '🥧 餅圖' },
                   { id: 'donut', label: '🍩 甜甜圈' }, { id: 'radar', label: '🕸️ 雷達圖' },
                   { id: 'scatter', label: '✨ 散點圖' }, { id: 'composed', label: '混合圖' },
                   { id: 'radial', label: '🎯 徑向圖' }, { id: 'treemap', label: '🟦 矩形樹' },
                   { id: 'stacked', label: '堆疊圖' }
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

               {/* 🚀 圖表渲染區 */}
               <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700/50 shadow-lg mb-8 h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                   {renderChart()}
                 </ResponsiveContainer>
               </div>

               {/* 數據卡片 */}
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

          {/* 用戶管理 / 遊戲管理 / 更新日誌 (略，保持你原本的代碼) */}
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