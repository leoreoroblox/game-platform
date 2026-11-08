'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [uid, setUid] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('username, uid')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setUsername(data.username);
          setUid(data.uid);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) {
        setUsername('');
        setUid('');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsername('');
    setUid('');
    setIsProfileOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav className="fixed top-0 w-full flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 z-50">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="Leo Game" className="h-10 object-contain" />
        </Link>

        {/* 電腦版導航連結 */}
        <div className="hidden md:flex gap-8 items-center font-medium text-sm text-gray-300">
          <Link href="#" className="hover:text-white transition">Explore</Link>
          <Link href="/create" className="hover:text-white transition">Create</Link>
          <Link href="/store" className="hover:text-white transition">Marketplace</Link>
          <Link href="#" className="hover:text-white transition">Community</Link>
          <Link href="#" className="hover:text-white transition">Developers</Link>
          
          {/* 🚀 新增的 Updates 按鈕 */}
          <Link href="/changelog" className="text-cyan-400 hover:text-cyan-300 transition font-bold flex items-center gap-1">
            Updates
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/login" className="hidden md:block text-gray-300 hover:text-white transition font-medium text-sm">
              Log In
            </Link>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-gray-800 p-1.5 rounded-lg transition"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'User'}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-gray-300 text-sm font-medium hidden md:block">{username}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden py-2">
                  <Link href={`/users/${uid}`} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">My Profile</Link>
                  <Link href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition">Settings</Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition">Log Out</button>
                </div>
              )}
            </div>
          )}

          <button className="hidden md:block bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition shadow-[0_0_15px_rgba(0,255,204,0.3)] hover:shadow-[0_0_25px_rgba(0,255,204,0.6)]">
            Download Client
          </button>

          {/* 手機版漢堡選單按鈕 */}
          <button className="md:hidden text-gray-300 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>
      </nav>

      {/* 手機版彈出選單 */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center gap-8 text-xl font-bold text-gray-300 md:hidden">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-3xl text-gray-500">✖</button>
          <Link href="#" onClick={() => setIsMenuOpen(false)}>Explore</Link>
          <Link href="/create" onClick={() => setIsMenuOpen(false)}>Create</Link>
          <Link href="#" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
          
          {/* 🚀 手機版新增的 Updates 按鈕 */}
          <Link href="/changelog" onClick={() => setIsMenuOpen(false)} className="text-cyan-400 font-bold">
            Updates
          </Link>

          {user ? (
            <button onClick={handleLogout} className="mt-8 text-red-400">Log Out</button>
          ) : (
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="mt-8 text-cyan-400">Log In</Link>
          )}
        </div>
      )}
    </>
  );
}