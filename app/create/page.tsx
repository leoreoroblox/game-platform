'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreateGamePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState('Action');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // 🚀 新增：權限檢查狀態
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [canUpload, setCanUpload] = useState(true);

  // 🚀 檢查是否被禁止上傳
  useEffect(() => {
    async function checkPermission() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('permissions')
        .eq('id', session.user.id)
        .single();

      if (data && data.permissions && data.permissions.upload === false) {
        setCanUpload(false);
      }
      setCheckingPermission(false);
    }
    checkPermission();
  }, [router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a .zip file to upload.');
      return;
    }

    setLoading(true);
    setMessage('Uploading game build... Please wait.');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single();
      const creatorName = userData?.username || 'Unknown Creator';

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('game-builds')
        .upload(fileName, file);

      if (uploadError) throw new Error('File upload failed: ' + uploadError.message);

      const { data: urlData } = supabase.storage
        .from('game-builds')
        .getPublicUrl(fileName);
      
      const publicZipUrl = urlData.publicUrl;

      const { error: dbError } = await supabase.from('games').insert([
        {
          title: title,
          description: description,
          cover_url: coverUrl || 'https://via.placeholder.com/400x200?text=No+Cover',
          zip_url: publicZipUrl,
          creator: creatorName,
          players: 0,
          category: category
        }
      ]);

      if (dbError) throw new Error('Database save failed: ' + dbError.message);

      setMessage('Game published successfully! Redirecting to home...');
      setTimeout(() => router.push('/'), 2000);

    } catch (err: any) {
      setMessage(err.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  // 載入中畫面
  if (checkingPermission) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-cyan-400">Checking permissions...</div>;
  }

  // 🚀 如果被剝奪了上傳權限，顯示這個畫面
  if (!canUpload) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white px-4 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-5xl mb-6 border border-red-500/30">
          🔒
        </div>
        <h1 className="text-3xl font-bold mb-4">Upload Permission Denied</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Your account has been restricted from uploading games to Leo Game. If you believe this is a mistake, please contact support.
        </p>
        <button onClick={() => router.push('/')} className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl transition font-bold">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-28 pb-10 px-8 flex justify-center">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-cyan-400">Publish New Game</h1>
        <p className="text-gray-400 mb-8 text-sm">Upload your game build (.zip) to the Leo Game platform.</p>

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Game Title</label>
            <input 
              type="text" 
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Space Adventure"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Category</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition appearance-none"
              value={category} onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Action">Action</option>
              <option value="Simulator">Simulator</option>
              <option value="RPG">RPG</option>
              <option value="Horror">Horror</option>
              <option value="Obby">Obby</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea 
              required
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition resize-none"
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your game about?"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Cover Image URL (Optional)</label>
            <input 
              type="url" 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
              value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/image.png"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Game Build (.zip)</label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-cyan-500 transition relative">
              <input 
                type="file" 
                accept=".zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-gray-400">
                {file ? (
                  <span className="text-cyan-400 font-bold">{file.name}</span>
                ) : (
                  <span>Click or drag a .zip file here to upload</span>
                )}
              </div>
            </div>
          </div>

          {message && <p className="text-cyan-300 text-sm text-center">{message}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Game'}
          </button>
        </form>
      </div>
    </div>
  );
}