import React, { useState } from 'react';
import { PlusCircle, Cpu, Check, Loader2 } from 'lucide-react';

interface BoxModelManagerProps {
  onAddModel: (capacity: number, panelType: string) => Promise<void>;
  loading: boolean;
}

export const BoxModelManager: React.FC<BoxModelManagerProps> = ({
  onAddModel,
  loading,
}) => {
  const [capacity, setCapacity] = useState('');
  const [panelType, setPanelType] = useState('');

  // Predefined Persian panel suggestions exactly matching uploaded Kotlin code
  const panelSuggestions = [
    'بدون تابلو',
    'تابلو ساده',
    'فول',
    'کنترل فاز و حرارت',
    'فول با عایق اضافه',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) return;
    if (!panelType.trim()) return;

    await onAddModel(capNum, panelType.trim());
    setCapacity('');
    setPanelType('');
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
      
      {/* Title */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-800 mb-6">
        <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">۱. فرم تعریف مدل باکس جدید</h2>
          <p className="text-xs text-slate-400 mt-0.5">افزودن مستقیم به جدول <code className="text-indigo-300">box_models</code> در دیتابیس</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Capacity Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            ظرفیت باکس (به تعداد ماینر، مثلاً ۹ یا ۱۵):
          </label>
          <div className="relative">
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="مثلاً: 12"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono transition-all pr-20"
              required
              min="1"
            />
            <span className="absolute right-4 top-3 text-xs font-bold text-slate-500">ظرفیت:</span>
          </div>
        </div>

        {/* Panel Type Suggestions */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2.5">
            نوع پنل برقی (انتخاب سریع از تگ‌های پرکاربرد یا تایپ دستی):
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {panelSuggestions.map((sug) => {
              const isSelected = panelType === sug;
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setPanelType(sug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{sug}</span>
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={panelType}
            onChange={(e) => setPanelType(e.target.value)}
            placeholder="یا عنوان دلخواه خود را اینجا بنویسید..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !capacity || !panelType}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>در حال ثبت در دیتابیس سوپابیس...</span>
            </>
          ) : (
            <>
              <Cpu className="w-5 h-5" />
              <span>ثبت نهایی مدل باکس جدید</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
