import React, { useState } from 'react';
import { BoxModel, Material } from '../types';
import { Sliders, Layers, Edit3, Loader2, AlertCircle } from 'lucide-react';

interface BomManagerProps {
  boxModels: BoxModel[];
  materials: Material[];
  onBatchUpsert: (capacity: number, materialId: string, quantity: number) => Promise<number>;
  onSingleUpsert: (modelId: string, materialId: string, quantity: number) => Promise<void>;
  loading: boolean;
}

export const BomManager: React.FC<BomManagerProps> = ({
  boxModels,
  materials,
  onBatchUpsert,
  onSingleUpsert,
  loading,
}) => {
  // 0 = Batch update by capacity, 1 = Single update by box model
  const [mode, setMode] = useState<0 | 1>(0);

  // Batch form
  const [batchMaterialId, setBatchMaterialId] = useState('');
  const [batchCapacity, setBatchCapacity] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('');

  // Single form
  const [singleModelId, setSingleModelId] = useState('');
  const [singleMaterialId, setSingleMaterialId] = useState('');
  const [singleQuantity, setSingleQuantity] = useState('');

  // Confirmation modal state
  const [confirmScope, setConfirmScope] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cap = parseInt(batchCapacity, 10);
    const qty = parseFloat(batchQuantity);
    if (isNaN(cap) || cap <= 0 || isNaN(qty) || qty < 0 || !batchMaterialId) return;

    const mat = materials.find((m) => m.id === batchMaterialId);

    setConfirmScope({
      title: 'تایید بروزرسانی دسته‌ای فرمول (BOM)',
      description: `میزان مصرف متریال «${mat?.name}» برای تمام باکس‌های با ظرفیت ${cap} دستگاه ماینر (در تمام پنل‌ها) به مقدار ${qty} تغییر خواهد کرد. آیا تایید می‌کنید؟`,
      action: async () => {
        await onBatchUpsert(cap, batchMaterialId, qty);
        setBatchQuantity('');
      },
    });
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(singleQuantity);
    if (isNaN(qty) || qty < 0 || !singleModelId || !singleMaterialId) return;

    await onSingleUpsert(singleModelId, singleMaterialId, qty);
    setSingleQuantity('');
  };

  const uniqueCapacities = Array.from(new Set(boxModels.map((b) => b.capacity))).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mt-8">
      
      {/* Title */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-800 mb-6">
        <div className="p-2.5 bg-amber-600/10 rounded-xl text-amber-400 border border-amber-500/20">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">۲. فرم تخصیص و ویرایش نرخ مصرف متریال (BOM)</h2>
          <p className="text-xs text-slate-400 mt-0.5">بروزرسانی مستقیم جدول پیوند <code className="text-amber-300">bom</code></p>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800/80">
        <button
          type="button"
          onClick={() => setMode(0)}
          className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === 0
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          بروزرسانی گروهی (بر اساس ظرفیت)
        </button>
        <button
          type="button"
          onClick={() => setMode(1)}
          className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === 1
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ویرایش تکی (انتخاب مدل باکس خاص)
        </button>
      </div>

      {/* Mode 0: Batch Upsert */}
      {mode === 0 ? (
        <form onSubmit={handleBatchSubmit} className="space-y-5 animate-fadeIn">
          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            💡 در این حالت، با انتخاب یک ظرفیت (مثلاً ۱۲ دستگاه ماینر)، میزان مصرف متریال برای تمامی مدل‌های ۱۲ دستگاه ماینر با پنل‌های مختلف به صورت یکجا تنظیم می‌شود.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">انتخاب متریال:</label>
              <select
                value={batchMaterialId}
                onChange={(e) => setBatchMaterialId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">— انتخاب متریال مصرفی —</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit_price.toLocaleString('fa-IR')} تومان)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ظرفیت هدف (تعداد ماینر):</label>
              <select
                value={batchCapacity}
                onChange={(e) => setBatchCapacity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">— انتخاب ظرفیت باکس —</option>
                {uniqueCapacities.map((c) => (
                  <option key={c} value={c}>
                    {c} ماینر (شامل {boxModels.filter((b) => b.capacity === c).length} مدل پنل)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">میزان مصرف جدید (تعداد یا مقدار اعشاری):</label>
            <input
              type="number"
              step="any"
              min="0"
              value={batchQuantity}
              onChange={(e) => setBatchQuantity(e.target.value)}
              placeholder="مثلاً: 1.5 یا 4"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !batchMaterialId || !batchCapacity || !batchQuantity}
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>اعمال ویرایش گروهی مصرف</span>
          </button>
        </form>
      ) : (
        /* Mode 1: Single Upsert */
        <form onSubmit={handleSingleSubmit} className="space-y-5 animate-fadeIn">
          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            💡 در این حالت، میزان مصرف متریال را صرفاً برای یک رکورد دقیق از مدل باکس مشخص می‌کنید.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">انتخاب مدل باکس:</label>
              <select
                value={singleModelId}
                onChange={(e) => setSingleModelId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">— انتخاب مدل دقیق باکس —</option>
                {boxModels.map((b) => (
                  <option key={b.id} value={b.id}>
                    باکس {b.capacity} دستگاه ماینر - پنل: {b.panel_type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">انتخاب متریال:</label>
              <select
                value={singleMaterialId}
                onChange={(e) => setSingleMaterialId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">— انتخاب متریال —</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit_price.toLocaleString('fa-IR')} ت)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">میزان مصرف دقیق:</label>
            <input
              type="number"
              step="any"
              min="0"
              value={singleQuantity}
              onChange={(e) => setSingleQuantity(e.target.value)}
              placeholder="مثلاً: 2.25"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !singleModelId || !singleMaterialId || !singleQuantity}
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
            <span>ثبت یا بروزرسانی تکی ردیف BOM</span>
          </button>
        </form>
      )}

      {/* Confirmation Modal */}
      {confirmScope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base">{confirmScope.title}</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 pl-2 border-r-2 border-amber-500 pr-3">
              {confirmScope.description}
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmScope(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={async () => {
                  await confirmScope.action();
                  setConfirmScope(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 cursor-pointer"
              >
                بله، تایید و ثبت شود
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
