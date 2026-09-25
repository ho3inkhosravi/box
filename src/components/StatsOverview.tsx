import React from 'react';
import { BoxModel, Material, BomItem } from '../types';
import { Package, Layers, Sliders, CheckCircle2 } from 'lucide-react';

interface StatsOverviewProps {
  boxModels: BoxModel[];
  materials: Material[];
  bomItems: BomItem[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  boxModels,
  materials,
  bomItems,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      
      {/* Box Models Stat */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
        <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">مدل‌های باکس تعریف‌شده</p>
            <h3 className="text-2xl font-black text-white font-mono">{boxModels.length} <span className="text-xs font-sans font-normal text-slate-400">مدل</span></h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-indigo-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>مرتب‌سازی خودکار بر اساس ظرفیت</span>
        </div>
      </div>

      {/* Materials Stat */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">اقلام متریال موجود</p>
            <h3 className="text-2xl font-black text-white font-mono">{materials.length} <span className="text-xs font-sans font-normal text-slate-400">قلم کالا</span></h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>نرخ‌گذاری بر حسب تومان</span>
        </div>
      </div>

      {/* BOM Records Stat */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">پیوندهای فرمول مصرفی (BOM)</p>
            <h3 className="text-2xl font-black text-white font-mono">{bomItems.length} <span className="text-xs font-sans font-normal text-slate-400">ردیف محاسبه</span></h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sliders className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-amber-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>پشتیبانی از ویرایش تکی و گروهی</span>
        </div>
      </div>

    </div>
  );
};
