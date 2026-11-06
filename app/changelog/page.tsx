'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function ChangelogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('changelogs')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-28 pb-20 px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white mb-6 inline-block font-bold">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-2">Changelog</h1>
        <p className="text-gray-400 mb-12">Latest updates and improvements to Leo Game.</p>

        {loading ? (
          <p className="text-cyan-400 animate-pulse">Loading updates...</p>
        ) : logs.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
            <p className="text-gray-400">No updates yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* 時間軸圓點 */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-900 text-cyan-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                {/* 內容卡片 */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-mono font-bold text-lg">{log.version}</span>
                    <span className="text-gray-500 text-xs">{new Date(log.created_at).toLocaleDateString('en-US')}</span>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">{log.title}</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{log.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}