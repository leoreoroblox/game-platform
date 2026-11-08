'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import AdminUserDrawer from '../components/AdminUserDrawer';
import AdminGameDrawer from '../components/AdminGameDrawer';
import AdminChangelog from '../components/AdminChangelog';
import MetricDetailModal from '../components/MetricDetailModal';
import EntityStatsModal from '../components/EntityStatsModal'; // 🚀 引入新的超級分析彈窗

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

  // 超級實體數據彈窗狀態
  const [statsEntity, setStatsEntity] = useState<{ data: any, type: 'user' | 'game' } | null>(null);

  // 全局圖表切換
  const [chartType, setChartType] = useState('area');
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  const [globalCoins, setGlobalCoins] = useState<number | ''>('');
  const [notifyCoins, setNotifyCoins] = useState(true); 
  const [isGloballyUpdating, setIsGloballyUpdating] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState<any>({
    announcement_text: '', announcement_speed: 20, announcement_direction: 'left',
    announcement_text_color: '#ffffff', announcement_bg_color: '#06b6d4',
    announcement_pause_hover: true, announcement_font_size: 'text-sm',
    maintenance_mode: false, maintenance_type: 'Scheduled Maintenance',
    maintenance_message: 'Leo Game is currently under maintenance.',
    maintenance_pre_warning: false, pre_warning_minutes: 10
  });

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  // ... 維護變數保持不變 (略)

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
      } else { router.push('/'); }
      setCheckingAuth(false);
    }
    checkAdmin();
  }, [router]);

  if (checkingAuth) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-mono">Checking Permissions...</div>;
  if (!isAdmin) return null;

  // (省略計算數據與 renderChart 等函數，請直接沿用上一版代碼)
  const totalCoins = users.reduce((acc, u) => acc + (u.leo_coins || 0), 0);
  const statsData = [ /* ... 請填回之前 32 個數據卡片的陣列 ... */ ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex relative overflow-hidden">
      
      {/* 各類彈窗 */}
      {statsEntity && (
        <EntityStatsModal entity={statsEntity.data} type={statsEntity.type} onClose={() => setStatsEntity(null)} />
      )}
      {selectedMetric && <MetricDetailModal metric={selectedMetric} onClose={() => setSelectedMetric(null)} />}
      {drawerUser && <AdminUserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onRefresh={fetchData} />}
      {drawerGame && <AdminGameDrawer game={drawerGame} onClose={() => setDrawerGame(null)} onRefresh={fetchData} />}

      {/* 左側邊欄 (略) */}
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
          
          {activeTab === 'users' && (
             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
               <table className="w-full text-left text-sm text-gray-400">
                 <tbody>
                   {users.map((user) => (
                     <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                       <td className="px-4 py-3 font-mono text-cyan-400">{user.uid}</td>
                       <td className="px-4 py-3 text-white font-medium">{user.username}</td>
                       <td className="px-4 py-3 flex gap-2">
                         {/* 🚀 新增的數據分析按鈕 */}
                         <button onClick={() => setStatsEntity({ data: user, type: 'user' })} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs transition">📊 數據</button>
                         <button onClick={() => setDrawerUser(user)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs transition">⚙️ 管理</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
          
          {activeTab === 'games' && (
             <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
               <table className="w-full text-left text-sm text-gray-400">
                 <tbody>
                   {games.map((game) => (
                     <tr key={game.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                       <td className="px-4 py-3 text-white font-medium">{game.title}</td>
                       <td className="px-4 py-3 flex gap-2">
                         {/* 🚀 新增的數據分析按鈕 */}
                         <button onClick={() => setStatsEntity({ data: game, type: 'game' })} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs transition">📊 數據</button>
                         <button onClick={() => setDrawerGame(game)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs transition">⚙️ 管理</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}

          {/* (其他 Tabs 代碼保持不變) */}
        </div>
      </div>
    </div>
  );
}