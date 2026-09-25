import React, { useState } from 'react';
import { SupabaseConfig } from '../types';
import { resetConfig } from '../services/supabase';
import { X, Save, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSave: (newConfig: SupabaseConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [url, setUrl] = useState(config.url);
  const [apiKey, setApiKey] = useState(config.apiKey);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ url, apiKey });
  };

  const handleReset = () => {
    const def = resetConfig();
    setUrl(def.url);
    setApiKey(def.apiKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">تنظیمات اتصال به سرور Supabase</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                آدرس سرور (Supabase REST API Base URL):
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyz...co/rest/v1/"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                کلید دسترسی (API Key / Service Role):
              </label>
              <textarea
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                rows={3}
                dir="ltr"
                placeholder="eyJ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono transition-colors resize-none"
                required
              />
            </div>
          </div>

          {/* RLS Tip Box (Retained exact Persian instruction from Kotlin) */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 space-y-2 text-amber-200/90 text-xs leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>راهنمای رفع خطای ۴۰۳ (مهم):</span>
            </div>
            <p>
              اگر در هنگام ثبت متریال، تغییر قیمت یا حذف رکوردی با خطای 403 مواجه شدید، به این دلیل است که قابلیت Row Level Security (RLS) در سوپابیس برای آن جدول فعال است.
            </p>
            <p className="font-medium text-slate-300">راهکار سریع:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>به پنل Supabase بخش Database ➔ Tables بروید و دکمه RLS را برای جداول (box_models, materials, bom) روی حالت Disable بگذارید.</li>
              <li>یا از تنظیمات سوپابیس، به جای کلید Anon، کلید مخفی <strong>service_role</strong> را کپی کرده و در کادر بالا ذخیره کنید.</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازگشت به پیش‌فرض اولیه</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره و اتصال مجدد</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
