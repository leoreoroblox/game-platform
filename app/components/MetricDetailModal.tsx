'use client';
import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';

export default function MetricDetailModal({ metric, onClose }: { metric: any, onClose: () => void }) {
  const [chartType, setChartType] = useState('area');
  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const trend = metric.trend || [];
  const pieData = trend.map((d: any) => ({ name: d.name, value: Number(d.value) || 0 })).filter((d: any) => d.value > 0);
  
  // 🚀 修復 TypeScript 報錯：為 v 加上 number 型別
  const validValues = trend.map((t: any) => Number(t.value)).filter((v: number) => !isNaN(v));
  const maxVal = validValues.length > 0 ? Math.max(...validValues, 1) : 1;
  
  const radarData = trend.map((d: any) => ({ subject: d.name, A: Number(d.value) || 0, fullMark: maxVal }));

  const renderChart = () => {
    const commonTooltip = <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />;

    if (!trend || trend.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">目前無足夠數據顯示圖表</div>;
    }

    switch (chartType) {
      case 'area': return <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" /><CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />{commonTooltip}<Area type="monotone" dataKey="value" name={metric.label} stroke="#06b6d4" strokeWidth={3} fill="url(#colorMetric)" /></AreaChart>;
      case 'line': return <LineChart data={trend}><XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" /><CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />{commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} /><Line type="monotone" dataKey="value" name={metric.label} stroke="#06b6d4" strokeWidth={3} dot={{ r: 6, fill: '#06b6d4' }} activeDot={{ r: 8 }} /></LineChart>;
      case 'bar': return <BarChart data={trend}><XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" /><CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />{commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} /><Bar dataKey="value" name={metric.label} fill="#06b6d4" radius={[4, 4, 0, 0]} /></BarChart>;
      case 'pie': 
        if (pieData.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">無足夠數據顯示餅圖</div>;
        return <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" stroke="none" label>{pieData.map((e: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>{commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} /></PieChart>;
      case 'donut': 
        if (pieData.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">無足夠數據顯示甜甜圈圖</div>;
        return <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">{pieData.map((e: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>{commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} /></PieChart>;
      case 'radar': 
        if (radarData.length === 0) return <div className="flex items-center justify-center h-full text-gray-500">無足夠數據顯示雷達圖</div>;
        return <RadarChart cx="50%" cy="50%" outerRadius={100} data={radarData}><PolarGrid stroke="#374151" /><PolarAngleAxis dataKey="subject" stroke="#9ca3af" /><PolarRadiusAxis stroke="#374151" /><Radar name={metric.label} dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />{commonTooltip}</RadarChart>;
      case 'composed': return <ComposedChart data={trend}><XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" /><CartesianGrid stroke="#374151" vertical={false} />{commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} /><Bar dataKey="value" name={metric.label} fill="#8b5cf6" barSize={20} radius={[4, 4, 0, 0]} /><Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} /></ComposedChart>;
      case 'stacked': return <AreaChart data={trend}><XAxis dataKey="name" stroke="#6b7280" /><YAxis stroke="#6b7280" /><CartesianGrid stroke="#374151" vertical={false} />{commonTooltip}<Legend wrapperStyle={{ color: '#fff' }} /><Area type="monotone" dataKey="value" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} /></AreaChart>;
      default: return <div className="flex items-center justify-center h-full text-gray-500">選擇圖表</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-opacity" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-4xl shadow-2xl transform transition-transform animate-[scaleIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-cyan-400 text-3xl">{metric.icon}</span> {metric.label} 趨勢分析
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl transition">✖</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 bg-gray-900 p-2 rounded-xl border border-gray-700">
          {[{ id: 'area', label: '📈 面積圖' }, { id: 'line', label: '📉 折線圖' }, { id: 'bar', label: '📊 柱狀圖' }, { id: 'pie', label: '🥧 餅圖' }, { id: 'donut', label: '🍩 甜甜圈' }, { id: 'radar', label: '🕸️ 雷達圖' }, { id: 'composed', label: '混合圖' }, { id: 'stacked', label: '堆疊圖' }].map(t => (
            <button key={t.id} onClick={() => setChartType(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${chartType === t.id ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(0,255,204,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>{t.label}</button>
          ))}
        </div>

        <div className="h-[350px] w-full bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
          {trend && trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">目前無足夠數據顯示圖表</div>
          )}
        </div>

        <div className="mt-4 flex justify-between text-sm text-gray-400 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <span>當前數值：<strong className="text-cyan-400 text-lg">{metric.val}</strong></span>
          <span>數據來源：Leo Game 系統自動生成</span>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}