import React, { useState, useMemo } from 'react';
import { packRects, Rect, Bin } from '../utils/binPacker';
import { X, Printer, Settings, ListChecks, Plus } from 'lucide-react';

interface CutMapViewerProps {
  parts: Rect[];
  onClose: () => void;
}

const DEFAULT_SHEET_SIZES = [
  { label: '366 × 183 cm (استاندارد بزرگ)', w: 366, h: 183 },
  { label: '280 × 122 cm (متوسط)', w: 280, h: 122 },
  { label: '244 × 122 cm (کوچک)', w: 244, h: 122 },
];

interface MapConfig {
  sheetW: number;
  sheetH: number;
  enableTrim: boolean;
}

export function CutMapViewer({ parts, onClose }: CutMapViewerProps) {
  const [sheetSizes, setSheetSizes] = useState(DEFAULT_SHEET_SIZES);
  
  // Custom size form
  const [customW, setCustomW] = useState('200');
  const [customH, setCustomH] = useState('100');
  
  // map index for each part
  const [partAssignments, setPartAssignments] = useState<number[]>(() => new Array(parts.length).fill(0));
  
  // config for each map
  const [mapsConfig, setMapsConfig] = useState<MapConfig[]>([
    { sheetW: 366, sheetH: 183, enableTrim: true }
  ]);

  const activeMapIndices = useMemo(() => {
    const maxAssignment = Math.max(0, ...partAssignments);
    const indices = [];
    for (let i = 0; i <= maxAssignment; i++) {
      indices.push(i);
    }
    return indices;
  }, [partAssignments]);

  const addCustomSize = () => {
    const w = Number(customW);
    const h = Number(customH);
    if (w > 0 && h > 0) {
      setSheetSizes([...sheetSizes, { label: `${w} × ${h} cm (سایز دلخواه)`, w, h }]);
    }
  };

  const handleTogglePart = (partIndex: number, mapIndex: number) => {
    setPartAssignments(prev => {
      const next = [...prev];
      if (next[partIndex] === mapIndex) {
        // Unchecking: moves it to the next map
        next[partIndex] = mapIndex + 1;
      } else {
        // Checking: brings it to this map
        next[partIndex] = mapIndex;
      }
      return next;
    });
    
    // Ensure map config exists
    setMapsConfig(prev => {
      const targetMapIndex = mapIndex + 1;
      if (targetMapIndex >= prev.length) {
        const next = [...prev];
        while (next.length <= targetMapIndex) {
          next.push({ ...prev[prev.length - 1] }); // Copy previous settings
        }
        return next;
      }
      return prev;
    });
  };

  const handleUpdateMapConfig = (mapIndex: number, updates: Partial<MapConfig>) => {
    setMapsConfig(prev => {
      const next = [...prev];
      next[mapIndex] = { ...next[mapIndex], ...updates };
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="max-w-5xl mx-auto p-4 md:p-8 mt-10 print:mt-0 bg-white print:bg-white rounded-2xl shadow-2xl print:shadow-none min-h-screen">
        
        {/* Global Header & Print Button */}
        <div className="flex justify-between items-start border-b border-gray-400 pb-2 mb-6 text-black">
          <div>
            <h1 className="text-xl font-bold font-sans">OptiCut 5.22e</h1>
            <h2 className="text-lg font-bold">PanelsCuttingList1</h2>
            <div className="text-sm">گزارش نقشه برش باکس ماینر</div>
            <div className="text-sm font-bold text-gray-700 mt-2">
              تاریخ: {new Date().toLocaleDateString('fa-IR')}
            </div>
          </div>
          <div className="flex gap-4 print:hidden">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <Printer size={20} />
              چاپ
            </button>
            <button 
              onClick={onClose}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <X size={20} />
              بستن
            </button>
          </div>
        </div>

        {/* Custom Sheet Size Adder (Hidden in print) */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-300 print:hidden text-slate-800 flex flex-wrap gap-4 items-end">
          <div className="text-sm font-bold text-slate-700 w-full mb-1">افزودن سایز ورق خام دلخواه:</div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">طول (cm)</label>
            <input type="number" value={customW} onChange={e => setCustomW(e.target.value)} className="border rounded p-1.5 w-24 text-center font-mono" dir="ltr" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">عرض (cm)</label>
            <input type="number" value={customH} onChange={e => setCustomH(e.target.value)} className="border rounded p-1.5 w-24 text-center font-mono" dir="ltr" />
          </div>
          <button onClick={addCustomSize} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg font-bold flex items-center gap-1 transition-colors">
            <Plus size={18} /> افزودن به لیست
          </button>
        </div>

        {/* Render each active Map */}
        {activeMapIndices.map((mapIndex) => {
          const config = mapsConfig[mapIndex] || mapsConfig[0];
          
          // Parts visible in this map checklist: all parts whose assignment >= mapIndex
          const mapPartsIndexed = parts
            .map((p, i) => ({ part: p, index: i }))
            .filter(pi => partAssignments[pi.index] >= mapIndex);
            
          // Parts actually PLACED on this specific map sheet
          const mapParts = parts.filter((p, i) => partAssignments[i] === mapIndex);
          
          const EDGE_TRIM = config.enableTrim ? 2 : 0;
          const USABLE_W = config.sheetW - (EDGE_TRIM * 2);
          const USABLE_H = config.sheetH - (EDGE_TRIM * 2);
          
          const bins = packRects(mapParts, USABLE_W, USABLE_H);
          
          const totalPieces = bins.reduce((acc, bin) => acc + bin.placed.length, 0);
          const totalUsedArea = bins.reduce((acc, bin) => acc + bin.usedArea, 0);
          const totalArea = bins.length * config.sheetW * config.sheetH;
          const totalWaste = totalArea > 0 ? ((1 - (totalUsedArea / totalArea)) * 100).toFixed(2) : "0.00";
          const totalUsedAreaM2 = (totalUsedArea / 10000).toFixed(2);

          return (
            <div key={mapIndex} className="mb-12 pb-12 border-b-4 border-slate-300 print:border-b-2 print:border-black last:border-b-0">
              
              <div className="flex items-center gap-2 mb-4 font-bold text-xl text-indigo-700 print:text-black">
                نقشه برش {mapIndex + 1}
              </div>

              {/* Settings Panel (Hidden in print) */}
              <div className="mb-6 bg-slate-100 p-4 rounded-xl border border-slate-300 print:hidden text-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sheet & Margin Settings */}
                  <div className="flex flex-col gap-4 border-l border-slate-300 pl-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-600">انتخاب ورق برای این نقشه:</label>
                      <select 
                        value={`${config.sheetW}x${config.sheetH}`}
                        onChange={(e) => {
                          const [w, h] = e.target.value.split('x').map(Number);
                          handleUpdateMapConfig(mapIndex, { sheetW: w, sheetH: h });
                        }}
                        className="bg-white border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-mono w-full"
                        dir="ltr"
                      >
                        {sheetSizes.map((sheet, idx) => (
                          <option key={idx} value={`${sheet.w}x${sheet.h}`}>{sheet.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={config.enableTrim}
                          onChange={(e) => handleUpdateMapConfig(mapIndex, { enableTrim: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="mr-3 text-sm font-bold text-slate-600">حاشیه ورق (۲ سانتی‌متر دور تا دور)</span>
                      </label>
                    </div>
                  </div>

                  {/* Parts Selector */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-slate-600 flex items-center gap-1">
                        <ListChecks size={16} /> قطعات روی این نقشه:
                      </label>
                    </div>
                    <div className="bg-white border border-slate-300 rounded-lg p-2 max-h-60 overflow-y-auto thin-scrollbar">
                      {mapPartsIndexed.map((pi) => {
                        const isUpper = pi.part.name.includes('بالا');
                        const isLower = pi.part.name.includes('پایین');
                        const textColor = isUpper ? 'text-blue-700' : isLower ? 'text-emerald-700' : 'text-slate-700';

                        return (
                        <div key={pi.index} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded border-b border-slate-100 last:border-0">
                          <label className="flex items-start gap-3 cursor-pointer w-full">
                            <input 
                              type="checkbox" 
                              checked={partAssignments[pi.index] === mapIndex}
                              onChange={() => handleTogglePart(pi.index, mapIndex)}
                              className="w-4 h-4 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 shrink-0"
                            />
                            <div className="flex flex-col w-full text-xs font-bold">
                              <span className={`${textColor} leading-relaxed break-words`}>{pi.part.name}</span>
                              <span dir="ltr" className="text-slate-500 font-mono text-left mt-1">
                                {pi.part.w}×{pi.part.h} <span className="text-blue-600">({pi.part.count})</span>
                              </span>
                            </div>
                          </label>
                        </div>
                      )})}
                      {mapPartsIndexed.length === 0 && (
                        <div className="text-xs text-slate-400 text-center py-2">قطعه‌ای موجود نیست</div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      * با برداشتن تیک، قطعه از این نقشه <b>خارج می‌شود</b> اما در لیست می‌ماند. قطعاتِ بدون تیک، برای برش در <b>نقشه‌های بعدی</b> قرار می‌گیرند.
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Table */}
              {mapParts.length > 0 && (
                <div className="overflow-x-auto mb-8 border border-gray-400">
                  <table className="w-full text-center text-sm text-black font-sans">
                    <thead className="bg-gray-100 border-b border-gray-400">
                      <tr>
                        <th className="py-2 px-4 border-l border-gray-400">تعداد ورق</th>
                        <th className="py-2 px-4 border-l border-gray-400">مجموع قطعات</th>
                        <th className="py-2 px-4 border-l border-gray-400">مساحت خالص (m²)</th>
                        <th className="py-2 px-4 border-l border-gray-400">ضخامت اره (mm)</th>
                        <th className="py-2 px-4 border-l border-gray-400">مساحت پرت (%)</th>
                        <th className="py-2 px-4">ابعاد ورق (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="font-bold">
                      <tr>
                        <td className="py-2 px-4 border-l border-gray-400">{bins.length}</td>
                        <td className="py-2 px-4 border-l border-gray-400">{totalPieces}</td>
                        <td className="py-2 px-4 border-l border-gray-400">{totalUsedAreaM2}</td>
                        <td className="py-2 px-4 border-l border-gray-400">4</td>
                        <td className="py-2 px-4 border-l border-gray-400 text-red-600">{totalWaste}%</td>
                        <td className="py-2 px-4 font-mono" dir="ltr">{config.sheetW} × {config.sheetH}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-6 justify-center items-center mb-8 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-600 rounded-sm"></div>
                  <span>باکس بالا</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-100 border border-emerald-600 rounded-sm"></div>
                  <span>باکس پایین</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 bg-white border-t-4 border-t-red-500 border border-slate-300 rounded-sm"></div>
                  <span>لبه نوار PVC (قرمز ضخیم)</span>
                </div>
              </div>

              {/* Bins Layout */}
              <div className="space-y-12">
                {bins.map((bin, i) => (
                  <div key={i} className="break-inside-avoid">
                    <div className="mb-2 flex justify-between items-end text-black font-bold text-sm">
                      <div className="flex gap-4">
                        <span>ورق شماره {i + 1}</span>
                        <span className="text-gray-600">({bin.placed.length} قطعه)</span>
                      </div>
                      <div className="text-gray-600 font-mono" dir="ltr">{config.sheetW} × {config.sheetH}</div>
                    </div>
                    
                    <div 
                      className="relative border-2 border-black bg-slate-200 mx-auto print:bg-white"
                      style={{
                        width: '100%',
                        maxWidth: '900px',
                        aspectRatio: `${config.sheetW} / ${config.sheetH}`
                      }}
                    >
                      {/* Trim Margin Area */}
                      {config.enableTrim && (
                        <div className="absolute inset-0 border-dashed border-red-400 border-[2px] opacity-50 m-0.5" style={{ pointerEvents: 'none' }} />
                      )}
                      
                      {/* Free Rects (Off-cuts) */}
                      {bin.freeRects.map((fr, j) => (
                        <div 
                          key={`free-${j}`}
                          className="absolute bg-gray-300 print:bg-gray-100 border border-gray-400 flex items-center justify-center overflow-hidden"
                          style={{
                            left: `${((config.enableTrim ? fr.x + 2 : fr.x) / config.sheetW) * 100}%`,
                            top: `${((config.enableTrim ? fr.y + 2 : fr.y) / config.sheetH) * 100}%`,
                            width: `${(fr.w / config.sheetW) * 100}%`,
                            height: `${(fr.h / config.sheetH) * 100}%`
                          }}
                        >
                          {(fr.w > 20 && fr.h > 15) && (
                            <span className="text-[10px] text-gray-500 font-mono rotate-0 print:text-gray-400">
                              {fr.w.toFixed(1)}×{fr.h.toFixed(1)}
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Placed Parts */}
                      {bin.placed.map((p, j) => {
                        const isUpper = p.name.includes('بالا');
                        const isLower = p.name.includes('پایین');
                        const borderColor = isUpper ? 'border-blue-600' : isLower ? 'border-emerald-600' : 'border-slate-800';
                        const bgColor = isUpper ? 'bg-blue-50' : isLower ? 'bg-emerald-50' : 'bg-white';
                        const textColor = isUpper ? 'text-blue-900' : isLower ? 'text-emerald-900' : 'text-slate-900';
                        
                        const screenTopBottomPVC = p.rotated ? (p.pW || 0) : (p.pL || 0);
                        const screenLeftRightPVC = p.rotated ? (p.pL || 0) : (p.pW || 0);

                        const style: any = {
                          left: `${((config.enableTrim ? p.x + 2 : p.x) / config.sheetW) * 100}%`,
                          top: `${((config.enableTrim ? p.y + 2 : p.y) / config.sheetH) * 100}%`,
                          width: `${(p.w / config.sheetW) * 100}%`,
                          height: `${(p.h / config.sheetH) * 100}%`,
                          borderStyle: 'solid',
                        };

                        const pvcColor = '#ef4444'; // red-500
                        const pvcWidth = '3.5px';

                        if (screenTopBottomPVC >= 1) {
                          style.borderTopColor = pvcColor;
                          style.borderTopWidth = pvcWidth;
                        }
                        if (screenTopBottomPVC === 2) {
                          style.borderBottomColor = pvcColor;
                          style.borderBottomWidth = pvcWidth;
                        }
                        if (screenLeftRightPVC >= 1) {
                          style.borderLeftColor = pvcColor;
                          style.borderLeftWidth = pvcWidth;
                        }
                        if (screenLeftRightPVC === 2) {
                          style.borderRightColor = pvcColor;
                          style.borderRightWidth = pvcWidth;
                        }

                        return (
                        <div 
                          key={`part-${j}`}
                          className={`absolute ${bgColor} border-[1px] ${borderColor} flex flex-col items-center justify-center overflow-hidden shadow-sm hover:brightness-95 transition-all cursor-crosshair group`}
                          style={style}
                          title={`${p.name}\n${p.w} × ${p.h} cm\nPVC Length: ${p.pL}, PVC Width: ${p.pW}`}
                        >
                          <span className={`text-[9px] md:text-xs font-bold text-center px-1 ${textColor} truncate w-full`}>
                            {p.name.split(' - ')[1] || p.name.split(' ')[0]}
                          </span>
                          <span className="text-[8px] md:text-[10px] font-mono text-gray-700 mt-0.5">
                            {p.w}×{p.h}
                          </span>
                        </div>
                      )})}
                    </div>
                  </div>
                ))}
                
                {bins.length === 0 && mapParts.length > 0 && (
                  <div className="text-center py-8 text-red-500 font-bold border-2 border-dashed border-red-300 rounded-xl bg-red-50">
                    قطعات به دلیل بزرگ بودن ابعاد، روی این ورق جا نمی‌شوند! سایز ورق را بزرگتر کنید.
                  </div>
                )}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
