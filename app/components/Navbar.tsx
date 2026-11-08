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
      <nav className="fixed top-0 w-full h-16 flex items-center justify-between px-6 bg-gray-950 border-b border-gray-800 z-50">
        
        {/* 左側 Logo 與連結 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Leo Game" className="h-10 object-contain" />
          </Link>

          <div className="hidden md:flex gap-6 items-center font-bold text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Explore</Link>
            <Link href="/create" className="hover:text-white transition">Create</Link>
            <Link href="/store" className="hover:text-white transition">Marketplace</Link>
            <Link href="/changelog" className="text-cyan-400 hover:text-cyan-300 transition">Updates</Link>
          </div>
        </div>

        {/* 右側用戶狀態 */}
        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/login" className="hidden md:block text-gray-300 hover:text-white transition font-bold text-sm">
              Log In
            </Link>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-gray-800 p-1.5 rounded-lg transition"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'User'}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-gray-300 text-sm font-bold hidden md:block">{username}</span>
              </button>

              {/* 下拉選單 */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden py-2">
                  <Link href={`/users/${uid}`} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition font-medium">My Profile</Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition font-medium">Settings</Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition font-bold">Log Out</button>
                </div>
              )}
            </div>
          )}

          <button className="hidden md:block bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-bold text-sm transition shadow-[0_0_15px_rgba(0,255,204,0.3)]">
            Download Client
          </button>

          {/* 手機版漢堡選單按鈕 */}
          <button className="md:hidden text-gray-300 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>
      </nav>

      {/* 手機版選單 */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 bg-gray-950/95 backdrop-blur-lg z-40 flex flex-col p-6 gap-6 text-lg font-bold text-gray-300 md:hidden">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Explore</Link>
          <Link href="/create" onClick={() => setIsMenuOpen(false)}>Create</Link>
          <Link href="/store" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
          <Link href="/changelog" onClick={() => setIsMenuOpen(false)} className="text-cyan-400">Updates</Link>
          
          {user ? (
             <button onClick={handleLogout} className="text-left text-red-400 mt-4">Log Out</button>
          ) : (
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-cyan-400 mt-4">Log In</Link>
          )}
        </div>
      )}
    </>
  );
}