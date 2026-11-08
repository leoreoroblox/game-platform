'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AvatarEditorModal({ currentConfig, userId, onClose, onSave }: any) {
  const [config, setConfig] = useState(currentConfig || {
    head: '#facc15', body: '#1f2937', arms: '#06b6d4', legs: '#111827'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('users').update({ avatar_config: config }).eq('id', userId);
    setSaving(false);
    onSave(config); // 更新前台的狀態
    onClose();
  };

  // 🚀 全英文設定
  const colorFields = [
    { key: 'head', label: 'Head Color' },
    { key: 'body', label: 'Torso (Shirt)' },
    { key: 'arms', label: 'Arms Color' },
    { key: 'legs', label: 'Legs (Pants)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">🎨 Edit Avatar</h2>
        
        <div className="space-y-6">
          {colorFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
              <label className="text-sm font-bold text-gray-300">{field.label}</label>
              <input 
                type="color" 
                value={config[field.key]} 
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer bg-transparent border-none"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition font-bold">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl transition">
            {saving ? 'Saving...' : 'Save Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}