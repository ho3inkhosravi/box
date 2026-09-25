import React, { useState } from 'react';
import { BoxModel, Material, BomItem } from '../types';
import { Database, Search, Trash2, Cpu, Layers, Sliders, AlertCircle } from 'lucide-react';

interface DatabaseViewerProps {
  boxModels: BoxModel[];
  materials: Material[];
  bomItems: BomItem[];
  onDeleteModel: (id: string) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onDeleteBom: (id: string) => Promise<void>;
  onSingleUpsert?: (modelId: string, materialId: string, quantity: number) => Promise<void>;
  loading: boolean;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({
  boxModels,
  materials,
  bomItems,
  onDeleteModel,
  onDeleteMaterial,
  onDeleteBom,
  onSingleUpsert,
  loading,
}) => {
  const [subTab, setSubTab] = useState<'models' | 'materials' | 'bom'>('models');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(50);
  const [editingBomId, setEditingBomId] = useState<string | null>(null);
  const [editingBomQty, setEditingBomQty] = useState<string>('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [expandedCap, setExpandedCap] = useState<number | null>(null);
  const [expandedMod, setExpandedMod] = useState<string | null>(null);
  const [showAllMats, setShowAllMats] = useState<boolean>(false);

  const handleDelete = async (type: 'model' | 'material' | 'bom', id?: string) => {
    if (!id || loading) return;
    let msg = 'آیا از حذف دائم این رکورد از پایگاه داده اطمینان دارید؟';
    if (type === 'model') msg = 'آیا از حذف دائم این مدل باکس و تمام فرمول‌های مرتبط با آن اطمینان دارید؟';
    if (type === 'material') msg = 'آیا از حذف دائم این متریال و تمام فرمول‌های مرتبط با آن اطمینان دارید؟';
    if (type === 'bom') msg = 'آیا از حذف دائم این ردیف مصرف متریال اطمینان دارید؟';
    if (!window.confirm(msg)) return;

    setDeletingId(id);
    try {
      if (type === 'model') await onDeleteModel(id);
      if (type === 'material') await onDeleteMaterial(id);
      if (type === 'bom') await onDeleteBom(id);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered lists
  const filteredModels = boxModels.filter((b) =>
    b.panel_type.toLowerCase().includes(search.toLowerCase()) ||
    b.capacity.toString().includes(search)
  ).slice(0, limit);

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.unit_price.toString().includes(search)
  ).slice(0, limit);

  const filteredBom = bomItems.filter((item) => {
    const matName = item.materials?.name || '';
    const panel = item.box_models?.panel_type || '';
    const cap = item.box_models?.capacity?.toString() || '';
    const q = search.toLowerCase();
    return matName.toLowerCase().includes(q) || panel.toLowerCase().includes(q) || cap.includes(q);
  }).slice(0, limit);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mt-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">مشاهده زنده جداول و مدیریت رکوردهای پایگاه داده</h2>
            <p className="text-xs text-slate-400 mt-0.5">نمایش مستقیم خروجی از سرور <code className="text-indigo-300">Supabase REST</code></p>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => { setSubTab('models'); setSearch(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'models' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>مدل‌ها ({boxModels.length})</span>
          </button>
          <button
            onClick={() => { setSubTab('materials'); setSearch(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'materials' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>متریال‌ها ({materials.length})</span>
          </button>
          <button
            onClick={() => { setSubTab('bom'); setSearch(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'bom' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>گزارش قیمت و BOM</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Limit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در نام، ظرفیت، پنل یا قیمت..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 pl-10 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
          <span>تعداد نمایش در جدول:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
        
        {/* Table 1: Box Models */}
        {subTab === 'models' && (
          <table className="w-full text-right text-xs text-slate-200">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">ردیف</th>
                <th className="px-4 py-3 font-semibold">ظرفیت (تعداد ماینر)</th>
                <th className="px-4 py-3 font-semibold">نوع پنل برقی</th>
                <th className="px-4 py-3 font-semibold font-mono">ID شناسه رکورد</th>
                <th className="px-4 py-3 font-semibold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">هیچ رکوردی یافت نشد.</td>
                </tr>
              ) : (
                filteredModels.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold font-mono text-indigo-400">{m.capacity} دستگاه ماینر</td>
                    <td className="px-4 py-3 font-bold text-white">{m.panel_type}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500 truncate max-w-[150px]" dir="ltr">{m.id}</td>
                    <td className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleDelete('model', m.id)}
                        disabled={deletingId === m.id}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                        title="حذف این باکس"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Table 2: Materials */}
        {subTab === 'materials' && (
          <table className="w-full text-right text-xs text-slate-200">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">ردیف</th>
                <th className="px-4 py-3 font-semibold">نام متریال مصرفی</th>
                <th className="px-4 py-3 font-semibold">قیمت واحد (تومان)</th>
                <th className="px-4 py-3 font-semibold font-mono">ID شناسه کالا</th>
                <th className="px-4 py-3 font-semibold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">هیچ متریالی یافت نشد.</td>
                </tr>
              ) : (
                filteredMaterials.map((mat, idx) => (
                  <tr key={mat.id || idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-emerald-300">{mat.name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-white">{mat.unit_price.toLocaleString('fa-IR')} <span className="text-[10px] font-sans font-normal text-slate-400">تومان</span></td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500 truncate max-w-[150px]" dir="ltr">{mat.id}</td>
                    <td className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleDelete('material', mat.id)}
                        disabled={deletingId === mat.id}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                        title="حذف متریال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Table 3: BOM Records (Grouped by Box Model) */}
        {subTab === 'bom' && (() => {
          const capacities = Array.from(new Set(filteredModels.map(m => Number(m.capacity)))).sort((a: any, b: any) => a - b);
          
          return (
            <div className="space-y-4 p-4">
              {capacities.length === 0 ? (
                <div className="text-center py-8 text-slate-500">هیچ باکسی یافت نشد.</div>
              ) : (
                capacities.map(cap => {
                  const capModels = filteredModels.filter(m => m.capacity === cap);
                  const isCapExpanded = expandedCap === cap;
                  
                  return (
                    <div key={cap} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <button 
                        className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
                        onClick={() => setExpandedCap(isCapExpanded ? null : cap)}
                      >
                        <div className="font-bold text-indigo-400 font-mono text-lg">ظرفیت {cap} دستگاه ماینر</div>
                        <div className="text-slate-400 text-sm">{capModels.length} مدل پنل</div>
                      </button>
                      
                      {isCapExpanded && (
                        <div className="p-4 space-y-4 bg-slate-950 border-t border-slate-800">
                          {capModels.map(model => {
                            const isModExpanded = expandedMod === model.id;
                            const modelBoms = bomItems.filter(b => b.model_id === model.id);
                            const totalModelPrice = modelBoms.reduce((acc, item) => acc + (item.materials?.unit_price || 0) * item.quantity, 0);
          
                            return (
                              <div key={model.id} className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                                <button 
                                  className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
                                  onClick={() => setExpandedMod(isModExpanded ? null : model.id)}
                                >
                                  <div className="font-bold text-slate-200">پنل {model.panel_type}</div>
                                  <div className="font-bold text-emerald-400 font-mono text-sm">
                                    قیمت تمام شده: {totalModelPrice > 0 ? `${totalModelPrice.toLocaleString('fa-IR')} تومان` : '—'}
                                  </div>
                                </button>
                                
                                {isModExpanded && (
                                  <div className="p-4 bg-slate-950 border-t border-slate-800">
                                    <div className="mb-4 flex justify-between items-center">
                                       <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                         <input 
                                           type="checkbox" 
                                           checked={showAllMats}
                                           onChange={(e) => setShowAllMats(e.target.checked)}
                                           className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                         />
                                         نمایش تمامی متریال‌ها (حتی مصرف صفر)
                                       </label>
                                    </div>
                                    <table className="w-full text-right text-xs text-slate-200">
                                      <thead className="text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800/60">
                                        <tr>
                                          <th className="px-2 py-2">نام متریال</th>
                                          <th className="px-2 py-2">قیمت واحد</th>
                                          <th className="px-2 py-2">میزان مصرف</th>
                                          <th className="px-2 py-2">قیمت کل</th>
                                          <th className="px-2 py-2 text-left">عملیات</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-800/40">
                                        {materials.map(mat => {
                                           const bomRecord = modelBoms.find(b => b.material_id === mat.id);
                                           const quantity = bomRecord ? bomRecord.quantity : 0;
                                           
                                           if (!showAllMats && quantity === 0) return null;
                                           
                                           const unitP = mat.unit_price || 0;
                                           const totalP = unitP * quantity;
                                           const editingKey = `${model.id}-${mat.id}`;
                                           const isEditing = editingBomId === editingKey;
          
                                           return (
                                            <tr key={mat.id} className="hover:bg-slate-900/30">
                                              <td className="px-2 py-2">{mat.name}</td>
                                              <td className="px-2 py-2 font-mono">{unitP.toLocaleString('fa-IR')} ت</td>
                                              <td className="px-2 py-2 font-mono text-amber-400">
                                                {isEditing ? (
                                                  <input 
                                                    type="number" 
                                                    step="any"
                                                    min="0"
                                                    className="w-16 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-white focus:outline-none focus:border-amber-500" 
                                                    value={editingBomQty}
                                                    onChange={(e) => setEditingBomQty(e.target.value)}
                                                  />
                                                ) : (
                                                  quantity > 0 ? quantity : <span className="text-slate-600">۰</span>
                                                )}
                                              </td>
                                              <td className="px-2 py-2 font-mono text-slate-300">{totalP > 0 ? `${totalP.toLocaleString('fa-IR')} ت` : '—'}</td>
                                              <td className="px-2 py-2 text-left flex justify-end gap-2">
                                                {isEditing ? (
                                                  <>
                                                    <button 
                                                      onClick={async () => {
                                                        if (!onSingleUpsert || !model.id || !mat.id) return;
                                                        const q = parseFloat(editingBomQty);
                                                        if (isNaN(q) || q < 0) return;
                                                        await onSingleUpsert(model.id, mat.id, q);
                                                        setEditingBomId(null);
                                                      }}
                                                      className="text-emerald-400 hover:text-emerald-300 cursor-pointer text-[11px] px-2 py-1 bg-emerald-500/10 rounded"
                                                    >
                                                      ثبت
                                                    </button>
                                                    <button onClick={() => setEditingBomId(null)} className="text-slate-400 hover:text-slate-300 cursor-pointer text-[11px] px-2 py-1 bg-slate-800 rounded">انصراف</button>
                                                  </>
                                                ) : (
                                                  <>
                                                    <button 
                                                      onClick={() => {
                                                        setEditingBomId(editingKey);
                                                        setEditingBomQty(quantity.toString());
                                                      }} 
                                                      className="text-amber-400 hover:text-amber-300 cursor-pointer text-[11px] px-2 py-1 bg-amber-500/10 rounded"
                                                    >
                                                      {quantity > 0 ? 'ویرایش' : 'افزودن'}
                                                    </button>
                                                    {quantity > 0 && bomRecord && bomRecord.id && (
                                                      <button
                                                        onClick={() => handleDelete('bom', bomRecord.id)}
                                                        disabled={deletingId === bomRecord.id}
                                                        className="text-rose-400 hover:text-rose-300 disabled:opacity-40 cursor-pointer text-[11px] px-2 py-1 bg-rose-500/10 rounded"
                                                      >
                                                        حذف
                                                      </button>
                                                    )}
                                                  </>
                                                )}
                                              </td>
                                            </tr>
                                           );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}

      </div>

      {/* RLS Alert Footer */}
      <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800/80">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>توجه: چنانچه دکمه حذف عمل نکرده و خطای 403 داد، مطابق راهنما باید RLS را در جدول مربوطه در سوپابیس غیرفعال کنید.</span>
      </div>

    </div>
  );
};
