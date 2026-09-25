import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, BoxModel, Material, BomItem, SupabaseConfig } from './types';
import { 
  getConfig, 
  saveConfig as saveSupabaseConfig, 
  fetchBoxModels, 
  insertBoxModel, 
  deleteBoxModel, 
  fetchMaterials, 
  insertMaterial, 
  updateMaterial, 
  deleteMaterial, 
  fetchBomItems, 
  upsertBomItem, 
  batchUpsertBom, 
  deleteBomItem 
} from './services/supabase';

import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { BoxModelManager } from './components/BoxModelManager';
import { MaterialManager } from './components/MaterialManager';
import { BomManager } from './components/BomManager';
import { DatabaseViewer } from './components/DatabaseViewer';
import CabinetCalculator from './components/CabinetCalculator';
import { AILabelScanner } from './components/AILabelScanner';
import { WindowsGuide } from './components/WindowsGuide';
import { SettingsModal } from './components/SettingsModal';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  state = { hasError: false, error: null as any };
  props!: {children: React.ReactNode};
  constructor(props: {children: React.ReactNode}) { super(props); }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-rose-500 bg-rose-500/10 rounded-xl m-8 font-mono text-left" dir="ltr">Error: {this.state.error?.message || 'Unknown error'}<br/>{this.state.error?.stack}</div>;
    }
    return this.props.children;
  }
}

const INITIAL_BOXES: BoxModel[] = [
  { id: 'box-12-a', capacity: 12, panel_type: 'تک فاز ساده آنالوگ' },
  { id: 'box-12-b', capacity: 12, panel_type: 'تک فاز دیجیتال هوشمند' },
  { id: 'box-24-a', capacity: 24, panel_type: 'سه فاز استاندارد صنعتی' },
  { id: 'box-24-b', capacity: 24, panel_type: 'سه فاز PLC اتوماسیون' },
  { id: 'box-36-a', capacity: 36, panel_type: 'تک فاز ویژه گلخانه' },
  { id: 'box-48-a', capacity: 48, panel_type: 'سه فاز هیدرولیک پیشرفته' },
];

const INITIAL_MATERIALS: Material[] = [
  { id: 'mat-sheet', name: 'ورق فولادی ۲ میلی‌متری روغنی', unit_price: 480000 },
  { id: 'mat-paint', name: 'رنگ پودری الکترواستاتیک کوره', unit_price: 185000 },
  { id: 'mat-relay', name: 'کنتاکتور اشنایدر ۲۵ آمپر', unit_price: 950000 },
  { id: 'mat-breaker', name: 'کلید مینیاتوری LS سه فاز', unit_price: 420000 },
  { id: 'mat-cable', name: 'کابل قدرت استاندارد (متر)', unit_price: 65000 },
  { id: 'mat-term', name: 'ترمینال ریلی رعد ۱۰', unit_price: 12500 },
];

const INITIAL_BOM: BomItem[] = [
  { id: 'bom-1', model_id: 'box-12-a', material_id: 'mat-sheet', quantity: 1.8, box_models: INITIAL_BOXES[0], materials: INITIAL_MATERIALS[0] },
  { id: 'bom-2', model_id: 'box-12-a', material_id: 'mat-paint', quantity: 0.5, box_models: INITIAL_BOXES[0], materials: INITIAL_MATERIALS[1] },
  { id: 'bom-3', model_id: 'box-12-a', material_id: 'mat-breaker', quantity: 2, box_models: INITIAL_BOXES[0], materials: INITIAL_MATERIALS[3] },
  { id: 'bom-4', model_id: 'box-24-a', material_id: 'mat-sheet', quantity: 3.2, box_models: INITIAL_BOXES[2], materials: INITIAL_MATERIALS[0] },
  { id: 'bom-5', model_id: 'box-24-a', material_id: 'mat-relay', quantity: 3, box_models: INITIAL_BOXES[2], materials: INITIAL_MATERIALS[2] },
  { id: 'bom-6', model_id: 'box-24-a', material_id: 'mat-cable', quantity: 8.5, box_models: INITIAL_BOXES[2], materials: INITIAL_MATERIALS[4] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('models');
  const [config, setConfig] = useState<SupabaseConfig>(getConfig);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Data State
  const [boxModels, setBoxModels] = useState<BoxModel[]>(INITIAL_BOXES);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [bomItems, setBomItems] = useState<BomItem[]>(INITIAL_BOM);

  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentCutList, setCurrentCutList] = useState<any[]>([]);
  
  // Toast notifications
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const refreshAll = useCallback(async (currentConfig = config, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [boxes, mats, boms] = await Promise.all([
        fetchBoxModels(currentConfig),
        fetchMaterials(currentConfig),
        fetchBomItems(currentConfig),
      ]);
      setBoxModels(boxes);
      setMaterials(mats);
      setBomItems(boms);
      setIsConnected(true);
      if (!silent) showToast('اطلاعات با موفقیت از Supabase بروزرسانی شد', 'success');
    } catch (err: any) {
      console.warn('Offline mode or Supabase error:', err);
      setIsConnected(false);
      if (!silent) showToast('عدم دسترسی به سرور Supabase. نمایش اطلاعات آفلاین محلی', 'info');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [config, showToast]);

  useEffect(() => {
    refreshAll(config, true);
  }, [refreshAll, config]);

  const handleSaveConfig = (newConfig: SupabaseConfig) => {
    const saved = saveSupabaseConfig(newConfig);
    setConfig(saved);
    setSettingsOpen(false);
    refreshAll(saved, false);
  };

  // --- Handlers ---

  const handleAddModel = async (capacity: number, panelType: string) => {
    if (!window.confirm(`آیا از ثبت مدل باکس جدید با ظرفیت ${capacity} دستگاه ماینر (${panelType}) اطمینان دارید؟`)) return;
    setLoading(true);
    try {
      if (isConnected) {
        await insertBoxModel(config, capacity, panelType);
        await refreshAll(config, true);
        showToast('مدل باکس با موفقیت در Supabase ثبت شد', 'success');
      } else {
        const newBox: BoxModel = { id: `local-box-${Date.now()}`, capacity, panel_type: panelType };
        setBoxModels(prev => [...prev, newBox].sort((a,b) => a.capacity - b.capacity));
        showToast('مدل باکس در حافظه محلی اضافه شد', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ثبت مدل', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (name: string, price: number) => {
    if (!window.confirm(`آیا از ثبت متریال جدید «${name}» با قیمت ${price.toLocaleString('fa-IR')} تومان اطمینان دارید؟`)) return;
    setLoading(true);
    try {
      if (isConnected) {
        await insertMaterial(config, name, price);
        await refreshAll(config, true);
        showToast('متریال جدید در Supabase ثبت شد', 'success');
      } else {
        const newMat: Material = { id: `local-mat-${Date.now()}`, name, unit_price: price };
        setMaterials(prev => [...prev, newMat].sort((a,b) => a.name.localeCompare(b.name, 'fa')));
        showToast('متریال در حافظه محلی اضافه شد', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ثبت متریال', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMaterial = async (id: string, name: string, price: number) => {
    if (!window.confirm(`آیا از ویرایش متریال «${name}» و تغییر قیمت آن به ${price.toLocaleString('fa-IR')} تومان اطمینان دارید؟`)) return;
    setLoading(true);
    try {
      if (isConnected && !id.startsWith('local-')) {
        await updateMaterial(config, id, name, price);
        await refreshAll(config, true);
        showToast('قیمت متریال در Supabase بروزرسانی شد', 'success');
      } else {
        setMaterials(prev => prev.map(m => m.id === id ? { ...m, name, unit_price: price } : m));
        showToast('قیمت متریال محلی بروزرسانی شد', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ویرایش متریال', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpsert = async (capacity: number, materialId: string, quantity: number): Promise<number> => {
    setLoading(true);
    try {
      if (isConnected) {
        const count = await batchUpsertBom(config, capacity, materialId, quantity);
        await refreshAll(config, true);
        showToast(`نرخ مصرف برای ${count} پنل با ظرفیت ${capacity} دستگاه ماینر بروزرسانی شد`, 'success');
        return count;
      } else {
        const matchingModels = boxModels.filter(b => b.capacity === capacity);
        const mat = materials.find(m => m.id === materialId);
        let updatedBom = [...bomItems];
        matchingModels.forEach(model => {
          const idx = updatedBom.findIndex(item => item.model_id === model.id && item.material_id === materialId);
          if (idx >= 0) {
            updatedBom[idx] = { ...updatedBom[idx], quantity };
          } else {
            updatedBom.push({
              id: `local-bom-${Date.now()}-${Math.random()}`,
              model_id: model.id,
              material_id: materialId,
              quantity,
              box_models: model,
              materials: mat
            });
          }
        });
        setBomItems(updatedBom);
        showToast(`نرخ مصرف محلی برای ${matchingModels.length} پنل بروزرسانی شد`, 'success');
        return matchingModels.length;
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ویرایش گروهی BOM', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSingleUpsert = async (modelId: string, materialId: string, quantity: number): Promise<void> => {
    if (!window.confirm(`آیا از ویرایش میزان مصرف این متریال به مقدار ${quantity} اطمینان دارید؟`)) return;
    setLoading(true);
    try {
      if (isConnected && !modelId.startsWith('local-')) {
        await upsertBomItem(config, modelId, materialId, quantity);
        await refreshAll(config, true);
        showToast('ردیف فرمول (BOM) در Supabase ثبت شد', 'success');
      } else {
        const model = boxModels.find(b => b.id === modelId);
        const mat = materials.find(m => m.id === materialId);
        let updatedBom = [...bomItems];
        const idx = updatedBom.findIndex(item => item.model_id === modelId && item.material_id === materialId);
        if (idx >= 0) {
          updatedBom[idx] = { ...updatedBom[idx], quantity };
        } else {
          updatedBom.push({
            id: `local-bom-${Date.now()}`,
            model_id: modelId,
            material_id: materialId,
            quantity,
            box_models: model,
            materials: mat
          });
        }
        setBomItems(updatedBom);
        showToast('ردیف فرمول محلی ثبت شد', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ثبت تکی BOM', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (id: string) => {
    setLoading(true);
    try {
      if (isConnected && !id.startsWith('local-')) {
        await deleteBoxModel(config, id);
        await refreshAll(config, true);
        showToast('مدل باکس از Supabase حذف شد', 'info');
      } else {
        setBoxModels(prev => prev.filter(b => b.id !== id));
        setBomItems(prev => prev.filter(item => item.model_id !== id));
        showToast('مدل باکس محلی حذف شد', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف مدل', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    setLoading(true);
    try {
      if (isConnected && !id.startsWith('local-')) {
        await deleteMaterial(config, id);
        await refreshAll(config, true);
        showToast('متریال از Supabase حذف شد', 'info');
      } else {
        setMaterials(prev => prev.filter(m => m.id !== id));
        setBomItems(prev => prev.filter(item => item.material_id !== id));
        showToast('متریال محلی حذف شد', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف متریال', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBom = async (id: string) => {
    setLoading(true);
    try {
      if (isConnected && !id.startsWith('local-')) {
        await deleteBomItem(config, id);
        await refreshAll(config, true);
        showToast('ردیف فرمول از Supabase حذف شد', 'info');
      } else {
        setBomItems(prev => prev.filter(item => item.id !== id));
        showToast('ردیف فرمول محلی حذف شد', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف ردیف BOM', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" dir="rtl">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border animate-bounce transition-all text-xs md:text-sm font-bold bg-slate-900/95 border-slate-700 max-w-lg w-[90%]">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
          <span className="text-slate-100 leading-relaxed">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      {activeTab !== 'cabinet' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefresh={() => refreshAll(config, false)}
          onOpenSettings={() => setSettingsOpen(true)}
          loading={loading}
          isConnected={isConnected}
        />
      )}

      {/* Main Content */}
      <main className={`w-full mx-auto flex flex-col ${activeTab === 'cabinet' ? 'flex-1' : 'flex-1 max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6'}`}>
        
        {/* Stats Overview */}
        {activeTab !== 'cabinet' && <StatsOverview boxModels={boxModels} materials={materials} bomItems={bomItems} />}

        {/* Active Tab Content */}
        {activeTab === 'models' && (
          <BoxModelManager onAddModel={handleAddModel} loading={loading} />
        )}

        {activeTab === 'materials' && (
          <MaterialManager
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            loading={loading}
          />
        )}

        {activeTab === 'bom' && (
          <BomManager
            boxModels={boxModels}
            materials={materials}
            onBatchUpsert={handleBatchUpsert}
            onSingleUpsert={handleSingleUpsert}
            loading={loading}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseViewer
            boxModels={boxModels}
            materials={materials}
            bomItems={bomItems}
            onDeleteModel={handleDeleteModel}
            onDeleteMaterial={handleDeleteMaterial}
            onDeleteBom={handleDeleteBom}
            onSingleUpsert={handleSingleUpsert}
            loading={loading}
          />
        )}

        {activeTab === 'cabinet' && (
          <ErrorBoundary>
            <CabinetCalculator onClose={() => setActiveTab('models')} onCutListUpdate={setCurrentCutList} />
          </ErrorBoundary>
        )}

        {activeTab === 'ai_scanner' && (
          <ErrorBoundary>
            <AILabelScanner currentCutList={currentCutList} />
          </ErrorBoundary>
        )}

        {activeTab === 'guide' && (
          <WindowsGuide onOpenSettings={() => setSettingsOpen(true)} />
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-[11px] text-slate-500 font-medium">
        <p>پنل جامع تولید و محاسبه فرمول ساخت (BOM) • منطبق بر آرشیو اندروید کاتلین و قابل اجرا در مرورگر و دسکتاپ ویندوز</p>
      </footer>

    </div>
  );
}
