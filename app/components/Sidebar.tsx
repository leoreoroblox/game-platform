'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (data) {
          setProfile(data);
          if (data.role === 'admin' || data.role === 'owner') {
            setIsAdmin(true);
          }
        }
      }
    }
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session) {
        setProfile(null);
        setIsAdmin(false);
      } else {
        checkUser();
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const menuItems = [
    { name: 'Home', icon: '🏠', href: '/', requireAuth: false },
    { name: '3D World', icon: '🌍', href: '/world', requireAuth: true },
    { name: 'Profile', icon: '👤', href: profile ? `/users/${profile.uid}` : '/login', requireAuth: true },
    { name: 'Avatar', icon: '🧍', href: '/avatar', requireAuth: true },
    { name: 'Store', icon: '🛍️', href: '/store', requireAuth: false },
    { name: 'Friends', icon: '👥', href: '/friends', requireAuth: true },
    { name: 'Settings', icon: '⚙️', href: '/settings', requireAuth: true },
  ];

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-40 hidden md:flex">
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2 px-3">
        {menuItems.map((item) => {
          if (item.requireAuth && !user) return null;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`px-4 py-3 rounded-xl flex items-center gap-4 font-bold transition ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="text-xl">{item.icon}</span> {item.name}
            </Link>
          );
        })}

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="px-4 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Administration</p>
            <Link 
              href="/admin" 
              className={`px-4 py-3 rounded-xl flex items-center gap-4 font-bold transition ${pathname === '/admin' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'text-red-500/80 hover:bg-red-500/10 hover:text-red-400'}`}
            >
              <span className="text-xl">🛡️</span> Admin Console
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}