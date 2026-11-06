import Link from 'next/link';

// 🚀 輔助函數：根據字串生成一個固定的色相 (0-360)
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 40%)`; // 生成飽和度 70% 的漂亮顏色
};

export default function GameCard({ id, title, creator, players, cover_url }: { id: string, title: string, creator: string, players: string, cover_url?: string }) {
  // 判斷是否有真實封面，如果沒有就用產生的漸層色
  const hasCover = cover_url && cover_url !== 'https://via.placeholder.com/400x200?text=No+Cover' && cover_url !== '1';
  const bgColor = stringToColor(title);

  return (
    <Link href={`/game/${id}`} className="block group">
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-400 transition cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,255,204,0.2)]">
        
        {/* 🚀 封面圖區塊 */}
        <div className="h-40 relative overflow-hidden">
          {hasCover ? (
            <img src={cover_url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center group-hover:scale-105 transition duration-500"
              style={{ background: `linear-gradient(135deg, ${bgColor}, #111827)` }}
            >
              <span className="text-6xl opacity-50 drop-shadow-lg">🎮</span>
            </div>
          )}
          {/* 漸層遮罩，讓文字更好看 */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        </div>

        <div className="p-4 relative">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition truncate">{title}</h3>
          <p className="text-sm text-gray-400 mb-3 truncate">By {creator}</p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-cyan-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              {players} Playing
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}