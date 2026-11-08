'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const banReasonsList = [
  { value: "Violation of Community Guidelines", label: "Violation of Community Guidelines" },
  { value: "Cheating or Using Exploits", label: "Cheating or Using Exploits" },
  { value: "Harassment or Bullying", label: "Harassment or Bullying" },
  { value: "Impersonating Staff Members", label: "Impersonating Staff Members" },
  { value: "Inappropriate Username or Avatar", label: "Inappropriate Username or Avatar" },
  { value: "Spamming or Scamming", label: "Spamming or Scamming" },
  { value: "Violation of Terms of Service", label: "Violation of Terms of Service" },
  { value: "Other", label: "Other" }
];

export default function AdminUserDrawer({ user, onClose, onRefresh }: { user: any, onClose: () => void, onRefresh: () => void }) {
  const [activeTab, setActiveTab] = useState<'info' | 'economy' | 'moderation'>('info');
  
  const [bio, setBio] = useState(user.bio || '');
  const [social, setSocial] = useState(user.social_link || '');
  const [role, setRole] = useState(user.role || 'user');
  const [coins, setCoins] = useState<number>(user.leo_coins || 0);
  const [coinChange, setCoinChange] = useState<string>('');
  
  const [banYears, setBanYears] = useState(0);
  const [banMonths, setBanMonths] = useState(0);
  const [banDays, setBanDays] = useState(0);
  const [banHours, setBanHours] = useState(0);
  const [banMinutes, setBanMinutes] = useState(0);
  const [banSeconds, setBanSeconds] = useState(0);
  const [previewEndTime, setPreviewEndTime] = useState<string>('Not banned');

  const [banReason, setBanReason] = useState(user.ban_reason || '');
  const [customReason, setCustomReason] = useState('');
  const [bannedIp, setBannedIp] = useState(user.banned_ip || '');
  const [bannedDeviceId, setBannedDeviceId] = useState(user.banned_device_id || '');
  const [permissions, setPermissions] = useState(user.permissions || { chat: true, upload: true, play: true });

  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setBio(user.bio || '');
    setSocial(user.social_link || '');
    setRole(user.role || 'user');
    setCoins(user.leo_coins || 0);
    setBannedIp(user.banned_ip || '');
    setBannedDeviceId(user.banned_device_id || '');
    setPermissions(user.permissions || { chat: true, upload: true, play: true });
    
    if (user.ban_reason && !banReasonsList.some(r => r.value === user.ban_reason)) {
      setBanReason("Other");
      setCustomReason(user.ban_reason);
    } else {
      setBanReason(user.ban_reason || '');
      setCustomReason('');
    }

    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      const diffMs = new Date(user.banned_until).getTime() - new Date().getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setBanDays(diffDays); setBanHours(diffHours); setBanMinutes(diffMinutes); setBanSeconds(diffSeconds);
    } else {
      setBanYears(0); setBanMonths(0); setBanDays(0); setBanHours(0); setBanMinutes(0); setBanSeconds(0);
    }
  }, [user]);

  useEffect(() => {
    if (banYears === 0 && banMonths === 0 && banDays === 0 && banHours === 0 && banMinutes === 0 && banSeconds === 0) {
      setPreviewEndTime('Not banned (Unbanned)'); return;
    }
    const date = new Date();
    date.setFullYear(date.getFullYear() + Number(banYears)); date.setMonth(date.getMonth() + Number(banMonths));
    date.setDate(date.getDate() + Number(banDays)); date.setHours(date.getHours() + Number(banHours));
    date.setMinutes(date.getMinutes() + Number(banMinutes)); date.setSeconds(date.getSeconds() + Number(banSeconds));
    setPreviewEndTime(date.toLocaleString());
  }, [banYears, banMonths, banDays, banHours, banMinutes, banSeconds]);

  const handleCoinChange = (amount: number) => { setCoins(Math.max(0, coins + amount)); };
  const togglePermission = (key: 'chat' | 'upload' | 'play') => { setPermissions({ ...permissions, [key]: !permissions[key] }); };

  const handleSave = async () => {
    setIsSaving(true); setMessage('');
    try {
      let bannedUntil = null;
      if (banYears > 0 || banMonths > 0 || banDays > 0 || banHours > 0 || banMinutes > 0 || banSeconds > 0) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + Number(banYears)); date.setMonth(date.getMonth() + Number(banMonths));
        date.setDate(date.getDate() + Number(banDays)); date.setHours(date.getHours() + Number(banHours));
        date.setMinutes(date.getMinutes() + Number(banMinutes)); date.setSeconds(date.getSeconds() + Number(banSeconds));
        bannedUntil = date.toISOString();
      }
      const finalBanReason = banReason === 'Other' ? customReason : banReason;

      const { error } = await supabase.from('users').update({
        bio, social_link: social, role, leo_coins: coins, banned_until: bannedUntil,
        ban_reason: finalBanReason, banned_ip: bannedIp || null, banned_device_id: bannedDeviceId || null, permissions
      }).eq('id', user.id);

      if (error) throw error;
      setMessage('✅ Settings saved successfully!'); onRefresh(); setTimeout(() => setMessage(''), 3000);
    } catch (err: any) { setMessage('❌ Error: ' + err.message); } finally { setIsSaving(false); }
  };

  const handleUnban = async () => {
    if (!confirm('Are you sure you want to remove all bans (Time, IP, Device) for this user?')) return;
    setIsSaving(true);
    const { error } = await supabase.from('users').update({ banned_until: null, ban_reason: null, banned_ip: null, banned_device_id: null }).eq('id', user.id);
    if (!error) {
      setMessage('✅ All bans lifted successfully!');
      setBanYears(0); setBanMonths(0); setBanDays(0); setBanHours(0); setBanMinutes(0); setBanSeconds(0);
      setBanReason(''); setCustomReason(''); setBannedIp(''); setBannedDeviceId(''); onRefresh();
    } else { setMessage('❌ Unban failed: ' + error.message); }
    setIsSaving(false);
  };

  // 🚀 新增：發送密碼重設信件
  const handleResetPassword = async () => {
    if (!user.email) {
      setMessage('❌ This user does not have an email address linked.');
      return;
    }
    if (!confirm(`Are you sure you want to send a password reset email to ${user.email}?`)) return;

    setIsResettingPassword(true);
    setMessage('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`, // 重設後引導回登入頁
    });

    if (error) {
      setMessage('❌ Failed to send reset email: ' + error.message);
    } else {
      setMessage('✅ Password reset email sent to ' + user.email);
    }
    setIsResettingPassword(false);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div className="flex items-center gap-4">
            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} className="w-12 h-12 rounded-full bg-gray-800" />
            <div>
              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <p className="text-sm text-cyan-400 font-mono">UID: {user.uid}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl transition active:scale-90">✖</button>
        </div>

        <div className="flex border-b border-gray-800 bg-gray-900">
          <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'info' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>📝 Basic Info</button>
          <button onClick={() => setActiveTab('economy')} className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'economy' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}>💰 Economy</button>
          <button onClick={() => setActiveTab('moderation')} className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'moderation' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500 hover:text-gray-300'}`}>🚫 Moderation</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div><label className="block text-sm font-bold text-gray-400 mb-2">Bio</label><textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white h-24 focus:outline-none focus:border-cyan-500" value={bio} onChange={(e) => setBio(e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-gray-400 mb-2">Social Link</label><input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500" value={social} onChange={(e) => setSocial(e.target.value)} /></div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Account Role</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">User</option><option value="admin">Admin</option><option value="moderator">Moderator</option>
                </select>
              </div>
              
              {/* 🚀 新增：密碼重設按鈕區塊 */}
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mt-6">
                <h3 className="text-sm font-bold text-gray-300 mb-2">🔒 Security</h3>
                <p className="text-xs text-gray-500 mb-3">As an admin, you cannot view the user's password. You can only send them a secure reset link.</p>
                <button 
                  onClick={handleResetPassword} 
                  disabled={isResettingPassword} 
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg transition text-sm btn-secondary disabled:opacity-50"
                >
                  {isResettingPassword ? 'Sending Email...' : '✉️ Send Password Reset Email'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'economy' && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <label className="block text-sm font-bold text-gray-400 mb-2">Current Coins</label>
                <div className="text-3xl font-bold text-yellow-400 mb-4">💰 {coins}</div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Adjust Coins</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="e.g., 1000" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-white" value={coinChange} onChange={(e) => setCoinChange(e.target.value)} />
                  <button onClick={() => { handleCoinChange(parseInt(coinChange) || 0); setCoinChange(''); }} className="bg-cyan-600 px-4 rounded-lg font-bold btn-primary">Apply</button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleCoinChange(100)} className="flex-1 bg-gray-700 text-xs py-1 rounded hover:bg-gray-600 font-bold btn-secondary">+100</button>
                  <button onClick={() => handleCoinChange(1000)} className="flex-1 bg-gray-700 text-xs py-1 rounded hover:bg-gray-600 font-bold btn-secondary">+1000</button>
                  <button onClick={() => handleCoinChange(-500)} className="flex-1 bg-gray-700 text-xs py-1 rounded hover:bg-gray-600 font-bold btn-secondary">-500</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/50">
                <h3 className="text-red-400 font-bold mb-4">⏳ Ban Duration</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Year', value: banYears, setter: setBanYears }, { label: 'Month', value: banMonths, setter: setBanMonths }, { label: 'Day', value: banDays, setter: setBanDays },
                    { label: 'Hour', value: banHours, setter: setBanHours }, { label: 'Min', value: banMinutes, setter: setBanMinutes }, { label: 'Sec', value: banSeconds, setter: setBanSeconds }
                  ].map((field, idx) => (
                    <div key={idx} className="flex flex-col">
                      <label className="text-[11px] text-gray-400 mb-1 px-1 font-bold">{field.label}</label>
                      <input type="number" min="0" placeholder="0" className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-red-500 text-center" value={field.value === 0 ? '' : field.value} onChange={(e) => field.setter(Number(e.target.value) || 0)} />
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900 p-2 rounded text-xs text-yellow-400 mb-4 border border-yellow-500/30 text-center font-bold">⏰ Expected Unban: {previewEndTime}</div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Ban Reason</label>
                <select className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-red-500 mb-3" value={banReason} onChange={(e) => setBanReason(e.target.value)}>
                  <option value="">-- Select Reason --</option>
                  {banReasonsList.map((reason) => (<option key={reason.value} value={reason.value}>{reason.label}</option>))}
                </select>
                {banReason === 'Other' && (<input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white mb-2" value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Enter custom reason..." />)}
              </div>

              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-gray-300 font-bold mb-4">🌐 IP & Device Ban</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Banned IP Address</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white placeholder-gray-600" placeholder="e.g., 192.168.1.1" value={bannedIp} onChange={(e) => setBannedIp(e.target.value)} />
                    <p className="text-[10px] text-gray-500 mt-1">Current IP: {user.current_ip || 'Not tracked'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-1">Banned Device ID</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white placeholder-gray-600" placeholder="Enter device UUID" value={bannedDeviceId} onChange={(e) => setBannedDeviceId(e.target.value)} />
                    <p className="text-[10px] text-gray-500 mt-1 truncate">Current Device: {user.device_id || 'Not tracked'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-gray-300 font-bold mb-4">Local Permissions</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer"><span className="text-sm font-bold">Allow Chat</span><input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={permissions.chat} onChange={() => togglePermission('chat')} /></label>
                  <label className="flex items-center justify-between cursor-pointer"><span className="text-sm font-bold">Allow Upload</span><input type="checkbox" className="w-5 h-5 accent-cyan-500" checked={permissions.upload} onChange={() => togglePermission('upload')} /></label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-950">
          {message && <p className="text-center text-sm mb-3 text-cyan-300 font-bold">{message}</p>}
          <div className="flex gap-3">
            <button onClick={handleUnban} disabled={isSaving} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition btn-danger disabled:opacity-50">🔓 Unban</button>
            <button onClick={handleSave} disabled={isSaving} className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition btn-primary disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </>
  );
}