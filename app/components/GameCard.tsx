import Link from 'next/link';

export default function GameCard({ id, title, creator, players }: { id: string, title: string, creator: string, players: string }) {
  return (
    <Link href={`/game/${id}`} className="block group">
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-400 transition cursor-pointer">
        <div className="h-40 bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-gray-600 transition">
          🎮 遊戲縮圖
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition">{title}</h3>
          <p className="text-sm text-gray-400 mb-3">By {creator}</p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-cyan-400">🟢 {players} Playing</span>
          </div>
        </div>
      </div>
    </Link>
  );
}