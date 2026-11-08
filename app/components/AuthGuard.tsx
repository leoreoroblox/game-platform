'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  // 表單狀態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setAuthError(''); setAuthSuccess('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !birthYear || !birthMonth || !birthDay) {
      setAuthError('Please fill in all fields.');
      return;
    }
    setSubmitting(true); setAuthError(''); setAuthSuccess('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { username } }
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: dbError } = await supabase.from('users').insert([{
          id: authData.user.id,
          uid: `UID-${Math.floor(Math.random() * 100000)}`,
          username: username,
          email: email,
          role: 'user',
          vip_level: '普通',
        }]);
        if (dbError) throw dbError;
      }
      setAuthSuccess('Registration successful! You are now logged in.');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // 如果正在檢查登入狀態，不顯示任何東西，避免閃爍
  if (loading) return <div className="min-h-screen bg-[#050810]"></div>;

  // 🚀 核心邏輯：無論如何都渲染 children，但如果沒登入，就用全螢幕遮罩蓋住它！
  return (
    <>
      <div className={!session ? 'hidden' : 'block'}>
        {children}
      </div>

      {!session && (
        <div className="fixed inset-0 z-[99999] bg-[#050810] flex flex-col items-center justify-center overflow-hidden">
          {/* 背景裝飾特效 */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          {/* 頂部 Logo */}
          <div className="mb-10 relative z-10">
            <img src="/logo.png" alt="Leo Game" className="h-24 object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]" />
          </div>

          {/* 登入/註冊卡片 */}
          <div className="bg-[#181a21] w-full max-w-[400px] rounded-xl p-8 relative z-10 shadow-2xl border border-gray-800">
            
            <h1 className="text-2xl font-bold text-white mb-6">
              {isLogin ? 'Log In' : 'Create Account'}
            </h1>

            {isLogin ? (
              /* ================= 登入表單 ================= */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email / Username</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2b2d33] border border-gray-600 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      className="w-full bg-[#2b2d33] border border-gray-600 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <button disabled={submitting} className="w-full bg-[#335fff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-md transition mt-4">
                  {submitting ? 'Logging in...' : 'Log In'}
                </button>
                <div className="text-center text-sm text-cyan-400 hover:underline cursor-pointer mt-2">Forgot Password or Username?</div>
                
                {authError && <p className="text-red-500 text-sm text-center mt-2">{authError}</p>}
                
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="px-4 text-xs text-gray-500 font-bold">OR</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                <div className="flex gap-2">
                  <button type="button" className="flex-1 bg-[#2b2d33] hover:bg-gray-700 text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" /> Google
                  </button>
                  <button type="button" className="flex-1 bg-[#2b2d33] hover:bg-gray-700 text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition">
                    <img src="https://www.svgrepo.com/show/512317/apple-173.svg" className="w-5 h-5 invert" /> Apple
                  </button>
                </div>

                <button type="button" onClick={() => setShowOtherOptions(true)} className="w-full bg-[#2b2d33] hover:bg-gray-700 text-white font-bold py-2.5 rounded-md transition mt-2">
                  Other Login Options
                </button>

                <div className="text-center text-sm text-gray-400 mt-6">
                  Don't have an account? <span onClick={() => setIsLogin(false)} className="text-white font-bold hover:underline cursor-pointer">Sign Up</span>
                </div>
              </form>
            ) : (
              /* ================= 註冊表單 ================= */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Birthday *</label>
                  <div className="flex gap-2">
                    <select className="flex-1 bg-[#2b2d33] border border-gray-600 rounded-md px-2 py-2 text-white focus:outline-none" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} required>
                      <option value="">Year</option>
                      {Array.from({ length: 20 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select className="flex-1 bg-[#2b2d33] border border-gray-600 rounded-md px-2 py-2 text-white focus:outline-none" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} required>
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select className="flex-1 bg-[#2b2d33] border border-gray-600 rounded-md px-2 py-2 text-white focus:outline-none" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} required>
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Username *</label>
                  <input type="text" placeholder="Don't use your real name" className="w-full bg-[#2b2d33] border border-gray-600 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email *</label>
                  <input type="email" className="w-full bg-[#2b2d33] border border-gray-600 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Password *</label>
                  <input type="password" className="w-full bg-[#2b2d33] border border-gray-600 rounded-md px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <button disabled={submitting} className="w-full bg-[#335fff] hover:bg-blue-600 text-white font-bold py-3 rounded-md transition mt-4">
                  {submitting ? 'Signing up...' : 'Sign Up'}
                </button>
                
                {authError && <p className="text-red-500 text-sm text-center mt-2">{authError}</p>}
                {authSuccess && <p className="text-green-500 text-sm text-center mt-2">{authSuccess}</p>}

                <div className="text-center text-sm text-gray-400 mt-6">
                  Already have an account? <span onClick={() => setIsLogin(true)} className="text-white font-bold hover:underline cursor-pointer">Log In</span>
                </div>
              </form>
            )}
          </div>

          {/* 其他登入選項彈窗 */}
          {showOtherOptions && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
              <div className="bg-[#181a21] w-full max-w-sm rounded-xl p-6 shadow-2xl border border-gray-800 relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Other Login Options</h2>
                  <button onClick={() => setShowOtherOptions(false)} className="text-gray-400 hover:text-white text-xl">✖</button>
                </div>
                <div className="space-y-3">
                  <button className="w-full bg-[#2b2d33] hover:bg-gray-700 text-white py-3 rounded-md text-sm font-bold flex items-center gap-3 px-4 transition">🔑 Passkey</button>
                  <button className="w-full bg-[#2b2d33] hover:bg-gray-700 text-white py-3 rounded-md text-sm font-bold flex items-center gap-3 px-4 transition">🔲 QR Code</button>
                  <button className="w-full bg-[#2b2d33] hover:bg-gray-700 text-white py-3 rounded-md text-sm font-bold flex items-center gap-3 px-4 transition">✉️ Email Me a Code</button>
                </div>
              </div>
            </div>
          )}

          {/* 底部版權字樣 */}
          <div className="mt-12 text-xs text-gray-600 relative z-10 text-center max-w-md leading-relaxed">
            By signing up, you agree to our <span className="text-gray-400 hover:underline cursor-pointer">Terms of Use</span> and <span className="text-gray-400 hover:underline cursor-pointer">Privacy Policy</span>.
          </div>
        </div>
      )}
    </>
  );
}