'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateUsername = (val: string) => {
    if (val.length < 8) return 'Username must be at least 8 characters.';
    if (!/^[a-zA-Z0-9._-]+$/.test(val)) return 'Only letters, numbers, and . _ - are allowed.';
    return '';
  };

  const validatePassword = (val: string) => {
    if (val.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(val)) return 'Must contain at least one uppercase letter.';
    if (!/[a-z]/.test(val)) return 'Must contain at least one lowercase letter.';
    return '';
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    setErrors(prev => ({ ...prev, username: validateUsername(val) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setErrors(prev => ({ ...prev, password: validatePassword(val) }));
  };

  const handleRegister = async () => {
    const uError = validateUsername(username);
    const pError = validatePassword(password);
    
    if (uError || pError) {
      setErrors({ username: uError, password: pError });
      return;
    }
    if (!email || !email.includes('@')) {
      setErrors(prev => ({ ...prev, general: 'Please enter a valid email address.' }));
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 1. 檢查使用者名稱是否重複
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        setErrors(prev => ({ ...prev, username: 'This username is already taken.' }));
        setLoading(false);
        return;
      }

      // 2. 建立 Auth 帳號
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // 3. 將資料寫入 users 表
      if (authData.user) {
        const { error: dbError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            uid: `UID-${Math.floor(Math.random() * 100000)}`,
            username: username,
            email: email,
            vip_level: '普通',
          }
        ]);
        if (dbError) throw dbError;
      }

      setErrors({ general: 'Registration successful! Redirecting to login...' });
      setTimeout(() => window.location.href = '/login', 2000);

    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white relative py-10">
      <Link href="/" className="mb-8">
        <img src="/logo.png" alt="Leo Game" className="h-16 object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
      </Link>

      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md relative z-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Account</h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
            <input 
              type="email" 
              placeholder="example@gmail.com"
              className={`w-full bg-gray-900 border rounded-lg px-4 py-3 text-white focus:outline-none transition ${!email ? 'border-gray-700 focus:border-cyan-500' : 'border-cyan-500/50'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Username</label>
            <input 
              type="text" 
              placeholder="Do not use your real name"
              className={`w-full bg-gray-900 border rounded-lg px-4 py-3 text-white focus:outline-none transition ${errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-cyan-500'}`}
              value={username}
              onChange={handleUsernameChange}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="At least 8 chars, 1 uppercase & 1 lowercase"
                className={`w-full bg-gray-900 border rounded-lg px-4 py-3 text-white focus:outline-none transition pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-cyan-500'}`}
                value={password}
                onChange={handlePasswordChange}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {errors.general && <p className="text-center text-sm text-yellow-400 mt-2">{errors.general}</p>}

          <button 
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition mt-4"
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </div>

        <div className="text-center mt-6 text-sm text-gray-400">
          Already have an account? <Link href="/login" className="text-cyan-400 hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
}