import React from 'react';
import { ActiveTab } from '../types';
import { Database, Cpu, Layers, Sliders, RefreshCw, Settings, Monitor, ScanLine } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  loading: boolean;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  onOpenSettings,
  loading,
  isConnected,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'models', label: 'مدل‌های باکس', icon: <Cpu className="w-4 h-4" /> },
    { id: 'materials', label: 'متریال‌ها و نرخ', icon: <Layers className="w-4 h-4" /> },
    { id: 'bom', label: 'فرمول مصرف (BOM)', icon: <Sliders className="w-4 h-4" /> },
    { id: 'database', label: 'مشاهده کل جداول', icon: <Database className="w-4 h-4" /> },
    { id: 'cabinet', label: 'محاسبات هوشمند کابینت', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: 'ai_scanner', label: 'هوش مصنوعی لیبل', icon: <ScanLine className="w-4 h-4 text-purple-400" /> },
    { id: 'guide', label: 'راهنمای اجرا و اتصال', icon: <Monitor className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/20">
              <Cpu className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
                پنل مدیریت تولید و فرمول (BOM)
              </h1>
              <div 
                onClick={() => setActiveTab('guide')}
                className="flex items-center gap-2 mt-1 cursor-pointer group hover:opacity-80 transition-opacity"
                title="برای مشاهده راهنمای اتصال کلیک کنید"
              >
                <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                <span className={`text-xs font-medium underline decoration-dotted underline-offset-4 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isConnected ? 'متصل به Supabase دیتابیس' : 'خطا در اتصال / آفلاین (کلیک برای راهنما)'}
                </span>
                <span className="text-slate-500 text-xs">• نسخه ویندوز / وب</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-sm font-medium transition-all shadow border border-slate-700/60 disabled:opacity-50 cursor-pointer"
              title="بارگذاری مجدد اطلاعات از سرور"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>بروزرسانی</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-sm font-medium transition-all border border-indigo-500/30 cursor-pointer"
              title="تنظیمات اتصال سرور سوپابیس"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">تنظیمات اتصال</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-6 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
