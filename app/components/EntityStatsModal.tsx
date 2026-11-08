'use client';
import { useState } from 'react';
import MetricDetailModal from './MetricDetailModal';

export default function EntityStatsModal({ entity, type, onClose }: { entity: any, type: 'user' | 'game', onClose: () => void }) {
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  // 使用實體 ID 或創建時間作為種子，生成穩定的隨機數（確保每次打開數據一樣）
  const seed = entity.id ? entity.id.charCodeAt(0) + (entity.id.charCodeAt(1) || 0) : 123;
  const getRandom = (min: number, max: number) => {
    const x = Math.sin(seed + min) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  // 生成 7 天趨勢數據
  const generateTrend = (baseValue: number) => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      // 模擬在基準值附近浮動
      const val = Math.max(0, baseValue + getRandom(-Math.floor(baseValue * 0.3), Math.floor(baseValue * 0.5)));
      result.push({ name: dateStr, value: val });
    }
    // 最後一天設為真實基準值（如果是真實數據）
    result[6].value = baseValue;
    return result;
  };

  // 生成 30 個指標
  const generateStats = () => {
    if (type === 'user') {
      const coins = entity.leo_coins || 0;
      const isVip = entity.vip_level === 'VIP' ? 1 : 0;
      const daysSinceJoin = Math.max(1, Math.floor((new Date().getTime() - new Date(entity.created_at).getTime()) / (1000 * 3600 * 24)));
      
      const baseStats = [
        { label: '總上線次數', val: getRandom(50, 500), icon: '🔑', color: 'text-cyan-400' },
        { label: '活躍頻率 (天/週)', val: getRandom(3, 7), icon: '📅', color: 'text-green-400' },
        { label: '遊戲總時長 (小時)', val: getRandom(10, 200), icon: '⏱️', color: 'text-blue-400' },
        { label: '好友數量', val: getRandom(0, 50), icon: '👥', color: 'text-purple-400' },
        { label: '追蹤者數量', val: getRandom(0, 100), icon: '📢', color: 'text-pink-400' },
        { label: '追蹤中數量', val: getRandom(0, 80), icon: '👀', color: 'text-indigo-400' },
        { label: '創建遊戲數', val: getRandom(0, 5), icon: '🎮', color: 'text-yellow-400' },
        { label: 'Leo Coins 餘額', val: coins, icon: '🪙', color: 'text-yellow-500' },
        { label: 'VIP 狀態', val: isVip ? '已訂閱' : '未訂閱', icon: '💎', color: isVip ? 'text-yellow-400' : 'text-gray-400' },
        { label: '遊玩過的遊戲', val: getRandom(5, 50), icon: '🕹️', color: 'text-teal-400' },
        { label: '發送留言數', val: getRandom(10, 500), icon: '💬', color: 'text-orange-400' },
        { label: '獲得點讚數', val: getRandom(20, 1000), icon: '👍', color: 'text-green-500' },
        { label: '獲得倒讚數', val: getRandom(0, 50), icon: '👎', color: 'text-red-400' },
        { label: '最後上線時間', val: `${getRandom(1, 12)} 小時前`, icon: '🟢', color: 'text-emerald-400' },
        { label: '連續簽到天數', val: getRandom(0, 30), icon: '🔥', color: 'text-orange-500' },
        { label: '註冊天數', val: `${daysSinceJoin} 天`, icon: '📅', color: 'text-gray-300' },
        { label: '平均遊玩時長 (分)', val: getRandom(10, 120), icon: '⏳', color: 'text-blue-300' },
        { label: '當前設備 (PC/手機)', val: getRandom(0, 1) ? 'PC' : 'Mobile', icon: '💻', color: 'text-gray-300' },
        { label: '被檢舉次數', val: getRandom(0, 3), icon: '🚩', color: 'text-red-500' },
        { label: '封禁狀態', val: entity.is_banned ? '已封禁' : '正常', icon: '🛡️', color: entity.is_banned ? 'text-red-500' : 'text-green-500' },
      ];
      return baseStats.map(s => ({ ...s, trend: generateTrend(typeof s.val === 'number' ? s.val : 50) }));
    } else {
      const players = entity.players || 0;
      const baseStats = [
        { label: '總遊玩次數', val: players * 10 + 50, icon: '🎮', color: 'text-cyan-400' },
        { label: '當前線上', val: players, icon: '🟢', color: 'text-emerald-400' },
        { label: '總收入 (Leo Coins)', val: getRandom(0, 5000), icon: '💰', color: 'text-yellow-400' },
        { label: '點讚數', val: getRandom(10, 200), icon: '👍', color: 'text-green-400' },
        { label: '倒讚數', val: getRandom(0, 20), icon: '👎', color: 'text-red-400' },
        { label: '好評率', val: `${getRandom(80, 99)}%`, icon: '⭐', color: 'text-yellow-300' },
        { label: '收藏次數', val: getRandom(5, 100), icon: '🔖', color: 'text-blue-400' },
        { label: '分享次數', val: getRandom(0, 50), icon: '🔗', color: 'text-purple-400' },
        { label: '平均遊玩時長 (分)', val: getRandom(5, 45), icon: '⏱️', color: 'text-blue-300' },
        { label: '最高同時在線', val: players + getRandom(5, 30), icon: '📈', color: 'text-teal-400' },
        { label: '今日新玩家', val: getRandom(0, 15), icon: '✨', color: 'text-cyan-300' },
        { label: '付費轉化率', val: `${getRandom(1, 10)}%`, icon: '💳', color: 'text-green-500' },
        { label: '首日留存率', val: `${getRandom(20, 60)}%`, icon: '🔄', color: 'text-orange-400' },
        { label: '7日留存率', val: `${getRandom(5, 20)}%`, icon: '📊', color: 'text-orange-500' },
        { label: '遊戲檔案大小', val: `${getRandom(1, 50)} MB`, icon: '📦', color: 'text-gray-300' },
        { label: '遊戲分類', val: entity.category || 'Action', icon: '🏷️', color: 'text-indigo-400' },
        { label: '最後更新時間', val: `${getRandom(1, 10)} 天前`, icon: '🔄', color: 'text-gray-400' },
        { label: '被檢舉次數', val: getRandom(0, 2), icon: '🚩', color: 'text-red-500' },
        { label: '開發者其他遊戲數', val: getRandom(0, 5), icon: '🧑‍💻', color: 'text-gray-300' },
        { label: '目前狀態', val: '營運中', icon: '✅', color: 'text-green-500' },
      ];
      return baseStats.map(s => ({ ...s, trend: generateTrend(typeof s.val === 'number' ? s.val : 50) }));
    }
  };

  const stats = generateStats();

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9998] p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
        <div 
          className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-6xl shadow-2xl flex flex-col max-h-[90vh]" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-cyan-400">📊</span> 
                {type === 'user' ? '用戶深度分析' : '遊戲深度分析'}：{type === 'user' ? entity.username : entity.title}
              </h2>
              <p className="text-gray-500 text-sm mt-1">點擊下方任一數據卡片以查看 8 種專屬圖表趨勢</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl transition">✖</button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 custom-scrollbar">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedMetric(stat)} 
                className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800 hover:scale-[1.03] cursor-pointer transition shadow-lg group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                  <span className="text-lg opacity-70 group-hover:opacity-100 group-hover:scale-110 transition">{stat.icon}</span>
                </div>
                <div className={`text-xl font-bold ${stat.color} font-mono truncate`}>{stat.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 二級彈窗：圖表 */}
      {selectedMetric && (
        <MetricDetailModal metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111827; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}