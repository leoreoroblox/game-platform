'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const Avatar3D = dynamic(() => import('../components/Avatar3D'), { ssr: false });

export default function AvatarPage() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setProfile(data);
    }
    check();
  }, [router]);

  if (!profile) return <div className="min-h-screen flex items-center justify-center text-cyan-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Avatar Editor</h1>
      <div className="w-full max-w-4xl mx-auto h-[500px] bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 relative shadow-2xl">
        <Avatar3D config={profile.avatar_config} />
        <div className="absolute bottom-4 right-4 bg-black/50 text-sm px-4 py-2 rounded-full">Drag to rotate</div>
      </div>
      <div className="text-center mt-8">
        <p className="text-gray-400">Full avatar editor coming soon in Leo Studio.</p>
      </div>
    </div>
  );
}