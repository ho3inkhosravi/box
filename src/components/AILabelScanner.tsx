import React, { useState, useEffect, useRef } from 'react';
import { Camera, Settings, Upload, Plus, Trash2, ArrowUp, ArrowDown, Play, FileText, CheckCircle2, AlertCircle, ScanLine, X, Loader2, FileUp } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error vite url import
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;


export interface ApiConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openrouter';
  key: string;
  model: string;
  status?: 'untested' | 'testing' | 'success' | 'error';
  availableModels?: string[];
  errorMessage?: string;
}

export function AILabelScanner({ currentCutList = [] }: { currentCutList?: any[] }) {
  const [activeTab, setActiveTab] = useState<'scanner' | 'settings'>('scanner');
  
  // Settings State
  const [configs, setConfigs] = useState<ApiConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ai_api_configs');
      return saved ? JSON.parse(saved).map((c: any) => ({
        ...c,
        name: c.name || (c.provider === 'gemini' ? 'Google AI Studio' : 'OpenRouter')
      })) : [
        { id: '1', name: 'Gemini Default', provider: 'gemini', key: '', model: 'gemini-1.5-flash' }
      ];
    } catch {
      return [{ id: '1', name: 'Gemini Default', provider: 'gemini', key: '', model: 'gemini-1.5-flash' }];
    }
  });

  // Scanner State
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  
  const generateCutListText = (list: any[]) => {
    if (!list || list.length === 0) return '';
    let text = '--- لیست قطعات ---\n';
    list.forEach(p => {
      text += `- ${p.name}: ${p.cutL} در ${p.cutW} | نوار: ${p.pvcText}\n`;
    });
    return text;
  };

  const [cutList, setCutList] = useState<string>('');
  
  // Auto-fill cut list when prop changes, if textarea is empty or matches old generated
  useEffect(() => {
    if (currentCutList && currentCutList.length > 0) {
      const newText = generateCutListText(currentCutList);
      setCutList(newText);
    }
  }, [currentCutList]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usedConnection, setUsedConnection] = useState<{name: string, provider: string, model: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    setError(null);
    try {
      const validConfigs = configs.filter(c => c.key.trim() !== '');
      if (validConfigs.length === 0) {
        throw new Error('ابتدا باید یک API Key معتبر در بخش تنظیمات وارد کنید.');
      }

      let base64Image = '';
      let fileMimeType = '';

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Cannot create canvas context');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await (page.render({ canvasContext: context, viewport: viewport, canvas: canvas } as any)).promise;
        base64Image = canvas.toDataURL('image/jpeg', 0.8);
        fileMimeType = 'image/jpeg';
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        base64Image = await new Promise<string>((resolve) => {
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
        fileMimeType = file.type;
      } else {
        throw new Error('فرمت فایل پشتیبانی نمی‌شود. لطفاً عکس یا PDF انتخاب کنید.');
      }

      if (!base64Image) throw new Error('خطا در تبدیل فایل به تصویر.');

      const prompt = `این یک فایل حاوی لیست برش یا نقشه قطعات (مانند خروجی OptiCut یا نرم‌افزارهای مشابه) است.
لطفاً تمام قطعات، ابعاد (طول و عرض) و تعداد/مقادیر را استخراج کرده و به صورت یک لیست متنی تمیز و مرتب خروجی بده.
فقط لیست قطعات را بنویس و هیچ متن اضافه‌ای ننویس.`;

      let responseText = '';
      let success = false;
      let connectionInfo = null;

      for (const config of validConfigs) {
        try {
          if (config.provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': config.key.trim()
              },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType: fileMimeType, data: base64Image.split(',')[1] } }
                  ]
                }]
              })
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(`خطای Gemini (HTTP ${res.status}): ${errData?.error?.message || 'نامشخص'}`);
            }
            const data = await res.json();
            responseText = data.candidates[0].content.parts[0].text;
          } else if (config.provider === 'openrouter') {
            const url = `https://openrouter.ai/api/v1/chat/completions`;
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.key}`
              },
              body: JSON.stringify({
                model: config.model,
                messages: [
                  {
                    role: 'user',
                    content: [
                      { type: 'text', text: prompt },
                      { type: 'image_url', image_url: { url: base64Image } }
                    ]
                  }
                ]
              })
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error(`خطای OpenRouter (HTTP ${res.status}): ${errData?.error?.message || 'نامشخص'}`);
            }
            const data = await res.json();
            responseText = data.choices[0].message.content;
          }
          
          success = true;
          connectionInfo = { name: config.name, provider: config.provider, model: config.model };
          break;
        } catch (err) {
          console.error(`Failed extraction with ${config.provider} (${config.model}):`, err);
        }
      }

      if (success) {
        setUsedConnection(connectionInfo);
        setCutList(responseText.trim());
      } else {
        throw new Error('خطا در ارتباط با هوش مصنوعی. لطفاً API Key ها و مدل‌های خود را بررسی کنید.');
      }
      
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    } catch (err: any) {
      console.error(err);
      setError('خطا در پردازش فایل: ' + err.message);
    }
    setIsExtractingPdf(false);
  };

  useEffect(() => {
    localStorage.setItem('ai_api_configs', JSON.stringify(configs));
  }, [configs]);

  const handleAddConfig = () => {
    setConfigs([...configs, { id: Date.now().toString(), name: 'اتصال جدید', provider: 'gemini', key: '', model: 'gemini-1.5-flash' }]);
  };

  const handleUpdateConfig = (id: string, field: keyof ApiConfig, value: string) => {
    setConfigs(configs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(configs.filter(c => c.id !== id));
  };

  const testConnection = async (id: string) => {
    const config = configs.find(c => c.id === id);
    if (!config || !config.key) return;
    
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, status: 'testing', errorMessage: '' } : c));
    
    try {
      if (config.provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
          headers: {
            'x-goog-api-key': config.key.trim()
          }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(`خطای گوگل (HTTP ${res.status}): ${errData?.error?.message || 'نامشخص'}`);
        }
        const data = await res.json();
        const models = data.models
          .filter((m: any) => m.name.includes('gemini'))
          .map((m: any) => m.name.replace('models/', ''));
        
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, status: 'success', availableModels: models } : c));
      } else if (config.provider === 'openrouter') {
        const authRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: { 'Authorization': `Bearer ${config.key.trim()}` }
        });
        if (!authRes.ok) {
          const errData = await authRes.json().catch(() => ({}));
          throw new Error(`خطای OpenRouter (HTTP ${authRes.status}): ${errData?.error?.message || 'کلید نامعتبر است'}`);
        }

        const res = await fetch('https://openrouter.ai/api/v1/models');
        if (!res.ok) throw new Error(`خطا در دریافت مدل‌ها (HTTP ${res.status})`);
        const data = await res.json();
        const models = data.data.map((m: any) => m.id);
        
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, status: 'success', availableModels: models } : c));
      }
    } catch (err: any) {
      setConfigs(prev => prev.map(c => c.id === id ? { ...c, status: 'error', errorMessage: err.message } : c));
    }
  };

  const moveConfig = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= configs.length) return;
    const newConfigs = [...configs];
    const temp = newConfigs[index];
    newConfigs[index] = newConfigs[index + direction];
    newConfigs[index + direction] = temp;
    setConfigs(newConfigs);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!image) {
      setError('لطفاً ابتدا تصویر لیبل را آپلود کنید.');
      return;
    }
    if (!cutList.trim()) {
      setError('لطفاً لیست برش مرجع را وارد کنید.');
      return;
    }
    
    const validConfigs = configs.filter(c => c.key.trim() !== '');
    if (validConfigs.length === 0) {
      setError('هیچ API Key معتبری یافت نشد. لطفاً در بخش تنظیمات یک کلید وارد کنید.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    const prompt = `شما یک دستیار هوش مصنوعی برای کارگاه نجاری و تولید باکس ماینر هستید.
کاربر تصویری از یک لیبل چسبانده شده روی ورق برش خورده MDF ارسال کرده است.
لیست برش مرجع نیز در ادامه آمده است.

وظیفه شما:
1. ابعاد (طول و عرض) و اطلاعات را از تصویر لیبل بخوانید. (ممکن است طول و عرض در لیبل جابجا چاپ شده باشند، مثلا 105 در 29 با 29 در 105 برابر است).
2. قطعه منطبق با این ابعاد را در لیست برش پیدا کنید.
3. نام دقیق ورق را برگردانید.

لیست برش مرجع:
${cutList}

پاسخ شما باید فقط و فقط شامل "نام ورق" باشد. از توضیحات اضافه و حاشیه روی خودداری کنید. اگر قطعه پیدا نشد بنویسید "قطعه پیدا نشد".`;

    let success = false;

    for (const config of validConfigs) {
      try {
        let responseText = '';
        if (config.provider === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': config.key.trim()
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: mimeType, data: image.split(',')[1] } }
                ]
              }]
            })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`خطای Gemini (HTTP ${res.status}): ${errData?.error?.message || 'نامشخص'}`);
          }
          const data = await res.json();
          responseText = data.candidates[0].content.parts[0].text;
        } else if (config.provider === 'openrouter') {
          const url = `https://openrouter.ai/api/v1/chat/completions`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.key}`
            },
            body: JSON.stringify({
              model: config.model,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: image } }
                  ]
                }
              ]
            })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`خطای OpenRouter (HTTP ${res.status}): ${errData?.error?.message || 'نامشخص'}`);
          }
          const data = await res.json();
          responseText = data.choices[0].message.content;
        }

        setResult(responseText.trim());
        setUsedConnection({ name: config.name, provider: config.provider, model: config.model });
        success = true;
        break; // Stop at first successful API call
      } catch (err) {
        console.error(`Failed with ${config.provider} (${config.model}):`, err);
        // Continue to next config in the list
      }
    }

    if (!success) {
      setError('ارتباط با تمامی API ها با خطا مواجه شد. لطفاً کلیدها و محدودیت‌های خود را بررسی کنید.');
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="bg-slate-900 min-h-[calc(100vh-120px)] rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row gap-6" dir="rtl">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'scanner' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <ScanLine size={20} />
          اسکنر لیبل
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          <Settings size={20} />
          تنظیمات API (اولویت‌بندی)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-y-auto">
        
        {/* TAB: SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 border-b border-slate-800 pb-4">
              <ScanLine className="text-indigo-500" />
              تشخیص قطعه از روی لیبل
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Inputs */}
              <div className="space-y-6">
                
                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-300">تصویر لیبل برش خورده</label>
                  
                  {!image ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-900/20 transition-all text-slate-400 hover:text-indigo-400 group"
                      >
                        <Camera size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">دوربین گوشی</span>
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-900/20 transition-all text-slate-400 hover:text-indigo-400 group"
                      >
                        <Upload size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">آپلود عکس</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img src={image} alt="Label" className="w-full h-48 object-cover rounded-xl border border-slate-700" />
                      <button 
                        onClick={() => { setImage(null); setResult(null); setError(null); }}
                        className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                  
                  <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleImageUpload} />
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                </div>

                {/* Cut List Textarea */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-300">لیست برش مرجع (متن)</label>
                    <button 
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isExtractingPdf}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-500/30"
                    >
                      {isExtractingPdf ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                      {isExtractingPdf ? 'در حال پردازش...' : 'استخراج از فایل (عکس/PDF) توسط هوش مصنوعی'}
                    </button>
                  </div>
                  <textarea 
                    value={cutList}
                    onChange={(e) => setCutList(e.target.value)}
                    placeholder="لیست قطعات به همراه ابعاد را اینجا پیست کنید... (مانند: سقف باکس (AB) - 105x83)"
                    className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-600 thin-scrollbar"
                    dir="auto"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">میتوانید مستقیماً متن فایل لیست برش را پیست کنید یا تصویر/PDF آن را بارگذاری کنید تا هوش مصنوعی آن را بخواند.</p>
                    {usedConnection && (
                      <span className="text-[10px] text-emerald-500/70 border border-emerald-900/30 bg-emerald-950/20 px-2 py-0.5 rounded">
                        استخراج شده با: {usedConnection.name}
                      </span>
                    )}
                  </div>
                  <input type="file" accept="application/pdf,image/*" ref={pdfInputRef} className="hidden" onChange={handlePdfUpload} />
                </div>

                {/* Action Button */}
                <button 
                  onClick={processImage}
                  disabled={isProcessing || !image || !cutList.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black text-lg transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      در حال پردازش هوش مصنوعی...
                    </>
                  ) : (
                    <>
                      <ScanLine size={24} />
                      تشخیص قطعه
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Results */}
              <div className="flex flex-col h-full space-y-6">
                <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  
                  {/* Background decoration */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <ScanLine size={200} />
                  </div>

                  {!result && !error && !isProcessing && (
                    <div className="text-slate-500 space-y-4">
                      <FileText size={48} className="mx-auto opacity-50" />
                      <p className="font-bold text-lg">منتظر اسکن لیبل...</p>
                      <p className="text-sm">عکس لیبل را بارگذاری کنید و دکمه تشخیص را بزنید.</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="text-indigo-400 space-y-6 z-10">
                      <div className="relative">
                        <ScanLine size={64} className="mx-auto animate-pulse" />
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-ping"></div>
                      </div>
                      <p className="font-bold text-xl animate-pulse">در حال تحلیل تصویر و جستجو در لیست...</p>
                    </div>
                  )}

                  {error && !isProcessing && (
                    <div className="text-red-400 space-y-4 z-10 bg-red-950/50 p-6 rounded-xl border border-red-900/50 w-full">
                      <AlertCircle size={48} className="mx-auto" />
                      <p className="font-bold text-lg">{error}</p>
                    </div>
                  )}

                  {result && !isProcessing && (
                    <div className="text-emerald-400 space-y-6 z-10 w-full animate-in fade-in zoom-in duration-300">
                      <CheckCircle2 size={64} className="mx-auto" />
                      <div className="space-y-2">
                        <p className="text-slate-400 font-bold">قطعه شناسایی شده:</p>
                        <div className="bg-emerald-950/50 border border-emerald-900/50 rounded-xl p-6">
                          <p className="font-black text-3xl md:text-4xl text-emerald-300 leading-tight">
                            {result}
                          </p>
                        </div>
                        {usedConnection && (
                          <p className="text-[10px] text-slate-500 mt-2">
                            پردازش شده توسط: {usedConnection.name} ({usedConnection.provider}) - {usedConnection.model}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 border-b border-slate-800 pb-4">
              <Settings className="text-indigo-500" />
              مدیریت API (Failover)
            </h2>
            
            <p className="text-slate-400 leading-relaxed">
              شما میتوانید چندین کلید API از سرویس‌های مختلف (Google AI Studio یا OpenRouter) تعریف کنید.
              سیستم به ترتیب اولویت (از بالا به پایین) درخواست را ارسال میکند. اگر کلید اول محدود شده باشد (Rate Limit)، به صورت خودکار سراغ کلید بعدی میرود.
            </p>

            <div className="space-y-4">
              {configs.map((config, index) => (
                <div key={config.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center relative group">
                  
                  {/* Order Controls */}
                  <div className="flex flex-col gap-1 shrink-0 bg-slate-950 rounded-lg p-1 border border-slate-800">
                    <button 
                      onClick={() => moveConfig(index, -1)}
                      disabled={index === 0}
                      className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveConfig(index, 1)}
                      disabled={index === configs.length - 1}
                      className="p-1 text-slate-500 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">نام اتصال</label>
                      <input 
                        type="text" 
                        value={config.name || ''}
                        onChange={(e) => handleUpdateConfig(config.id, 'name', e.target.value)}
                        placeholder="مثلا: کلید اصلی"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">سرویس دهنده</label>
                      <select 
                        value={config.provider}
                        onChange={(e) => handleUpdateConfig(config.id, 'provider', e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="gemini">Google Gemini</option>
                        <option value="openrouter">OpenRouter</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500">مدل</label>
                      </div>
                      
                      {config.availableModels && config.availableModels.length > 0 ? (
                        <select
                          value={config.model}
                          onChange={(e) => handleUpdateConfig(config.id, 'model', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                          dir="ltr"
                        >
                          {config.availableModels.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={config.model}
                          onChange={(e) => handleUpdateConfig(config.id, 'model', e.target.value)}
                          placeholder="gemini-1.5-flash"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-700"
                          dir="ltr"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500">API Key</label>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => testConnection(config.id)}
                            disabled={!config.key || config.status === 'testing'}
                            className="text-[10px] bg-indigo-900/50 text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 disabled:opacity-50 transition-all whitespace-nowrap"
                          >
                            {config.status === 'testing' ? 'در حال بررسی...' : 'بررسی اتصال'}
                          </button>
                          {config.status === 'success' && <span className="text-[10px] text-emerald-400 flex items-center gap-1 whitespace-nowrap"><CheckCircle2 size={12}/> متصل شد</span>}
                          {config.status === 'error' && <span className="text-[10px] text-red-400 flex items-center gap-1 whitespace-nowrap"><AlertCircle size={12}/> خطا</span>}
                        </div>
                      </div>
                      <input 
                        type="password" 
                        value={config.key}
                        onChange={(e) => handleUpdateConfig(config.id, 'key', e.target.value)}
                        placeholder="sk-or-v1-..."
                        className={`w-full bg-slate-950 border ${config.status === 'error' ? 'border-red-500/50' : config.status === 'success' ? 'border-emerald-500/50' : 'border-slate-700'} rounded-lg px-3 py-2 text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-700`}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  {config.errorMessage && (
                    <div className="w-full mt-3 text-xs text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">
                      {config.errorMessage}
                    </div>
                  )}

                  <button 
                    onClick={() => handleDeleteConfig(config.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors absolute top-4 left-4 md:relative md:top-auto md:left-auto mt-0 md:mt-6"
                    title="حذف API"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddConfig}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold px-4 py-2 hover:bg-indigo-900/20 rounded-lg transition-colors border border-dashed border-indigo-900 w-full justify-center"
            >
              <Plus size={20} />
              افزودن API جدید
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
