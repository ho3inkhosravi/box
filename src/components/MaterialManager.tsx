import React, { useState } from 'react';
import { Material } from '../types';
import { Layers, Plus, Edit3, Loader2, Check } from 'lucide-react';

interface MaterialManagerProps {
  materials: Material[];
  onAddMaterial: (name: string, price: number) => Promise<void>;
  onUpdateMaterial: (id: string, name: string, price: number) => Promise<void>;
  loading: boolean;
}

export const MaterialManager: React.FC<MaterialManagerProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  loading,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) return;
    if (!name.trim()) return;

    if (editingId) {
      await onUpdateMaterial(editingId, name.trim(), priceNum);
      setEditingId(null);
    } else {
      await onAddMaterial(name.trim(), priceNum);
    }
    setName('');
    setPrice('');
  };

  const handleStartEdit = (mat: Material) => {
    if (!mat.id) return;
    setEditingId(mat.id);
    setName(mat.name);
    setPrice(mat.unit_price.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPrice('');
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mt-8">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingId ? 'ویرایش نرخ و مشخصات متریال' : '۳. فرم تعریف اقلام متریال و قیمت واحد'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">مدیریت مستقیم جدول <code className="text-emerald-300">materials</code></p>
          </div>
        </div>
        {editingId && (
          <button
            onClick={handleCancelEdit}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 cursor-pointer"
          >
            انصراف از ویرایش
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              نام متریال مصرفی:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: ورق گالوانیزه ۱.۵ یا رنگ پودری"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              قیمت واحد (به تومان):
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="مثلاً: 450000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono transition-all"
              required
              min="0"
              step="any"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name || !price}
          className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
            editingId
              ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : editingId ? (
            <>
              <Check className="w-5 h-5" />
              <span>ثبت تغییرات قیمت متریال</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>افزودن متریال جدید به انبار</span>
            </>
          )}
        </button>
      </form>

      {/* Quick selection list */}
      {materials.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-xs font-bold text-slate-400 mb-3">انتخاب سریع برای ویرایش قیمت:</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {materials.map((m) => (
              <button
                key={m.id}
                onClick={() => handleStartEdit(m)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all cursor-pointer group"
              >
                <span>{m.name}</span>
                <span className="text-emerald-400 font-mono">({m.unit_price.toLocaleString('fa-IR')} ت)</span>
                <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
