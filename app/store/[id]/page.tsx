'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';

function StoreItemContent() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: itemData } = await supabase.from('avatar_items').select('*').eq('id', params.id).single();
      if (itemData) setItem(itemData);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setCurrentUser(userData);
      }
      setLoading(false);
    }
    if (params.id) fetchData();
  }, [params.id]);

  const handlePurchase = async () => {
    if (!currentUser) {
      setMessage('Please log in to purchase items.');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    if (currentUser.leo_coins < item.price) {
      setMessage('Not enough Leo Coins!');
      return;
    }

    setBuying(true);
    setMessage('');

    try {
      const newCoins = currentUser.leo_coins - item.price;
      await supabase.from('users').update({ leo_coins: newCoins }).eq('id', currentUser.id);
      await supabase.from('user_inventory').insert([{ user_id: currentUser.id, item_id: item.id }]);

      if (item.category === 'color_pack' || item.item_data) {
        await supabase.from('users').update({ avatar_config: item.item_data }).eq('id', currentUser.id);
      }

      setMessage('Purchase successful! Redirecting...');
      setTimeout(() => router.push(`/users/${currentUser.uid}`), 2000);
    } catch (err: any) {
      setMessage('Purchase failed. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-cyan-400 flex items-center justify-center animate-pulse">Loading Item...</div>;
  if (!item) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Item not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-10 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/store')} className="text-gray-400 hover:text-white mb-6 inline-block font-bold transition active:scale-95">← Back to Catalog</button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl relative">
            <img src={item.image_url || 'https://via.placeholder.com/500'} alt={item.name} className="w-full h-auto object-cover aspect-square" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
              ⭐ {item.likes} Likes
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold mb-2">{item.name}</h1>
            <p className="text-cyan-400 mb-6 font-medium text-lg">By {item.creator_name}</p>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold">Price</span>
                <span className="text-3xl font-black text-yellow-400 flex items-center gap-2">
                  🪙 {item.price}
                </span>
              </div>

              {message && <p className="text-center text-sm mb-4 text-cyan-300 font-bold bg-cyan-900/30 py-2 rounded-lg">{message}</p>}

              {/* 🚀 套用按鈕點擊反饋 */}
              <button 
                onClick={handlePurchase}
                disabled={buying}
                className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl text-lg mb-3 btn-primary disabled:opacity-50 disabled:active:scale-100"
              >
                {buying ? 'Processing...' : 'Buy Now'}
              </button>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="font-bold text-white mb-4">Description</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between text-sm">
                <span className="text-gray-500">Item Type</span>
                <span className="text-white uppercase">{item.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreItemDetail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>}>
      <StoreItemContent />
    </Suspense>
  );
}