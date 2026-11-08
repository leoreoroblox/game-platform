'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import AdminUserDrawer from '../components/AdminUserDrawer';
import AdminGameDrawer from '../components/AdminGameDrawer';
import AdminChangelog from '../components/AdminChangelog';
import MetricDetailModal from '../components/MetricDetailModal';
import EntityStatsModal from '../components/EntityStatsModal';

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

  const [statsEntity, setStatsEntity] = useState<{ data: any, type: 'user' | 'game' } | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [chartType, setChartType] = useState('area');

  const [globalCoins, setGlobalCoins] = useState<number | ''>('');
  const [notifyCoins, setNotifyCoins] = useState(true); 
  const [isGloballyUpdating, setIsGloballyUpdating] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState<any>({
    announcement_text: '', announcement_speed: 20, announcement_direction: 'left',
    announcement_text_color: '#ffffff', announcement_bg_color: '#06b6d4',
    announcement_pause_hover: true, announcement_font_size: 'text-sm',
    maintenance_mode: false, maintenance_type: 'Scheduled Maintenance',
    maintenance_message: 'Leo Game is currently under maintenance.',
    maintenance_pre_warning: false, pre_warning_minutes: 10,
    maintenance_notice: '' // 🚀 新增專屬公告狀態
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
      if (!session) { router.push('/'); return; } // 🚀 改成回首頁，首頁會自動彈出登入牆
      const { data: userData } = await supabase.from('users').select('role').eq('id', session.user.id).single();
      if (userData?.role === 'admin' || userData?.role === 'owner') { 
        setIsAdmin(true); 
        fetchData(); 
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 2500); 
      } else { router.push('/'); }
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
          announcement_bg_color: '#eab308', announcement_text_color: '#000000', announcement_speed: 15,
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
      maintenance_notice: siteSettings.maintenance_notice, // 🚀 儲存專屬公告
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
      maintenance_mode: false, maintenance_start_time: null, maintenance_end_time: null, maintenance_notice: null
    }).eq('id', 1);
    if (error) showToast('❌ 結束失敗'); else { showToast('✅ 維護已結束'); fetchData(); }
  };

  if (checkingAuth) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-mono">Checking Permissions...</div>;
  if (!isAdmin) return null;

  // (中間的數據計算與圖表渲染函數保持不變，為了節省版面省略，請直接沿用上一版的內容)
  const totalCoins = users.reduce((acc, u) => acc + (u.leo_coins || 0), 0);
  const actionGames = games.filter(g => g.category === 'Action').length;
  const rpgGames = games.filter(g => g.category === 'RPG').length;
  const simulatorGames = games.filter(g => g.category === 'Simulator').length;

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
      {selectedMetric && <MetricDetailModal metric={selectedMetric} onClose={() => setSelectedMetric(null)} />}
      {statsEntity && <EntityStatsModal entity={statsEntity.data} type={statsEntity.type} onClose={() => setStatsEntity(null)} />}

      {/* 🚀 啟動維護彈窗 (新增專屬公告輸入框) */}
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
                    {[{ label: '年', value: startDelayYears, setter: setStartDelayYears }, { label: '月', value: startDelayMonths, setter: setStartDelayMonths }, { label: '日', value: startDelayDays, setter: setStartDelayDays }, { label: '時', value: startDelayHours, setter: setStartDelayHours }, { label: '分', value: startDelayMinutes, setter: setStartDelayMinutes }, { label: '秒', value: startDelaySeconds, setter: setStartDelaySeconds }].map((f, i) => (
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
                <label className="block text-sm text-gray-400 mb-2">維護提示訊息 (支援換行)</label>
                <textarea className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white h-20 resize-none" value={siteSettings.maintenance_message} onChange={(e) => setSiteSettings({...siteSettings, maintenance_message: e.target.value})} placeholder="請輸入維護提示..." />
              </div>

              {/* 🚀 專屬公告輸入框 */}
              <div>
                <label className="block text-sm text-yellow-500 mb-2 font-bold">維護專屬公告 (顯示在倒數計時上方，選填)</label>
                <input type="text" className="w-full bg-gray-900 border border-yellow-900/50 rounded-lg p-3 text-yellow-400" value={siteSettings.maintenance_notice} onChange={(e) => setSiteSettings({...siteSettings, maintenance_notice: e.target.value})} placeholder="例如：由於發現嚴重漏洞，維護時間將延長..." />
              </div>

              <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                <label className="block text-sm text-gray-400 mb-3 font-bold">預計維護時長 (從開始維護算起)</label>
                <div className="grid grid-cols-6 gap-2">
                  {[{ label: '年', value: mYears, setter: setMYears }, { label: '月', value: mMonths, setter: setMMonths }, { label: '日', value: mDays, setter: setMDays }, { label: '時', value: mHours, setter: setMHours }, { label: '分', value: mMinutes, setter: setMMinutes }, { label: '秒', value: mSeconds, setter: setMSeconds }].map((f, i) => (
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

      {/* 左側邊欄 (保持不變) */}
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

      {/* 右側主要內容 (保持不變) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-900 z-10">
        <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-8">
          <div className="text-gray-400 capitalize font-bold">{activeTab}</div>
          <div className="flex items-center gap-4"><span className="text-sm text-gray-300 font-bold">👑 管理員</span><div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center font-bold">L</div></div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* 這裡請保留你原本寫好的 Dashboard, Users, Games, Changelog 程式碼 */}
          {/* 如果你是用上一版完整的代碼覆蓋，這裡只要把 global 分頁裡的維護按鈕保留即可 */}
        </div>
      </div>
    </div>
  );
}