'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function StorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase.from('avatar_items').select('*').order('created_at', { ascending: false });
      if (data) setItems(data);
      setLoading(false);
    }
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-10 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Catalog</h1>
          <div className="flex w-full md:w-auto gap-4">
            <input 
              type="text" 
              placeholder="Search items..." 
              className="flex-1 md:w-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none">
              <option>All Categories</option>
              <option>Hats</option>
              <option>Shirts</option>
              <option>Accessories</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-cyan-400 py-20 animate-pulse">Loading Catalog...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <Link href={`/store/${item.id}`} key={item.id} className="group block bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500 transition shadow-lg hover:shadow-[0_0_15px_rgba(0,255,204,0.2)]">
                <div className="aspect-square bg-gray-900 relative overflow-hidden">
                  <img src={item.image_url || 'https://via.placeholder.com/300'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  {item.category === 'hat' && (
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">LIMITED</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">By {item.creator_name}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-yellow-400 font-bold flex items-center gap-1">🪙 {item.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}