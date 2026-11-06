'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 最新的登入邏輯：支援 Email 或 用戶名
  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    
    let loginEmail = email; 

    try {
      // 如果沒有 @，代表是輸入用戶名
      if (!loginEmail.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', loginEmail)
          .single();

        if (userError || !userData) {
          setMessage('Invalid Username or Email.');
          setLoading(false);
          return;
        }
        loginEmail = userData.email; // 替換成真實 Email
      }

      // 拿 Email 和密碼去登入
      const { error } = await supabase.auth.signInWithPassword({ 
        email: loginEmail, 
        password: password 
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Login successful! Redirecting...');
        setTimeout(() => window.location.href = '/', 1500);
      }
    } catch (err: any) {
      setMessage('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // 佔位用的 Google 登入函數（解決報錯）
  const handleGoogleLogin = () => {
    setMessage('Google Login is coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="bg-gray-800 p-10 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Login to Leo Game</h1>
          <p className="text-gray-400 text-sm">Welcome back! Please enter your details.</p>
        </div>

        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Email / Username"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 caret-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 caret-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Processing...' : 'Log In'}
          </button>
        </div>

        {message && <p className="text-center text-sm mt-4 text-cyan-300">{message}</p>}

        <div className="text-center mt-4">
          <Link href="#" className="text-sm text-gray-400 hover:text-white transition">Forgot Password or Username?</Link>
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-4 text-xs text-gray-500 uppercase">Or</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-3 rounded-lg transition">Email me a One-Time Code</button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-3 rounded-lg transition">Quick Login</button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-3 rounded-lg transition">Other Login Options</button>
        </div>

        <div className="mt-8 space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account? <Link href="/register" className="text-cyan-400 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}