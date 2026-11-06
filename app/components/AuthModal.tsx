'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleAuth = async () => {
    setLoading(true);
    setMessage('');
    
    if (isLogin) {
      // 登入邏輯
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        setMessage('Login successful!');
        setTimeout(() => onClose(), 1000); // 1秒後關閉彈窗
      }
    } else {
      // 註冊邏輯
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Registration successful! You can now log in.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl w-96 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">✖</button>
        
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email address"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button 
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </div>

        {message && <p className="text-center text-sm mt-4 text-cyan-300">{message}</p>}

        <div className="text-center mt-6 text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }} className="text-cyan-400 hover:underline">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}