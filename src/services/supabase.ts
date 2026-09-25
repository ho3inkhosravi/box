import { BomItem, BoxModel, Material, SupabaseConfig } from '../types';

export const DEFAULT_CONFIG: SupabaseConfig = {
  url: 'https://vuzjtxtzhkgvfqufywcq.supabase.co/rest/v1/',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emp0eHR6aGtndmZxdWZ5d2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDI4NjcsImV4cCI6MjA5NjA3ODg2N30.P4yd1ovRZFpMf3NDnLK5e_YWw0I-iqSIdHt_LoMXNiE',
};

export const getConfig = (): SupabaseConfig => {
  const stored = localStorage.getItem('supabase_config_web');
  if (stored) {
    try {
      const parsed: SupabaseConfig = JSON.parse(stored);
      if (!parsed.apiKey || parsed.apiKey.includes('sb_secret_') || parsed.apiKey.includes('sb_publishable_') || !parsed.url.includes('vuzjtxtzhkgvfqufywcq')) {
        saveConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
      }
      return parsed;
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = (config: SupabaseConfig): SupabaseConfig => {
  let formattedUrl = config.url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }
  if (!formattedUrl.endsWith('/')) {
    formattedUrl = `${formattedUrl}/`;
  }
  if (!formattedUrl.includes('/rest/v1/')) {
    formattedUrl = formattedUrl.replace(/\/$/, '') + '/rest/v1/';
  }
  const cleanConfig = { url: formattedUrl, apiKey: config.apiKey.trim() };
  localStorage.setItem('supabase_config_web', JSON.stringify(cleanConfig));
  return cleanConfig;
};

export const resetConfig = (): SupabaseConfig => {
  localStorage.setItem('supabase_config_web', JSON.stringify(DEFAULT_CONFIG));
  return DEFAULT_CONFIG;
};

const getHeaders = (config: SupabaseConfig) => ({
  apikey: config.apiKey,
  Authorization: `Bearer ${config.apiKey}`,
  'Content-Type': 'application/json',
});

// --- Box Models ---
export const fetchBoxModels = async (config: SupabaseConfig): Promise<BoxModel[]> => {
  const allItems: BoxModel[] = [];
  let rangeStart = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`${config.url}box_models?select=*&order=capacity.asc`, {
      headers: { ...getHeaders(config), Range: `${rangeStart}-${rangeStart + pageSize - 1}` },
    });
    if (!res.ok) throw new Error(`خطا در دریافت لیست مدل‌های باکس (${res.status})`);
    const data = await res.json();
    allItems.push(...data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      rangeStart += pageSize;
    }
  }
  return allItems;
};

export const insertBoxModel = async (config: SupabaseConfig, capacity: number, panelType: string): Promise<BoxModel> => {
  const res = await fetch(`${config.url}box_models`, {
    method: 'POST',
    headers: { ...getHeaders(config), Prefer: 'return=representation' },
    body: JSON.stringify({ capacity, panel_type: panelType }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`خطا در ثبت مدل باکس: ${res.status} - ${err}`);
  }
  const data = await res.json();
  return data[0];
};

export const deleteBoxModel = async (config: SupabaseConfig, id: string): Promise<void> => {
  try {
    await fetch(`${config.url}bom?model_id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(config),
    });
  } catch (e) {
    console.warn('Optional cascading BOM delete skipped', e);
  }
  const res = await fetch(`${config.url}box_models?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(config),
  });
  if (!res.ok) throw new Error(`خطا در حذف باکس (${res.status})`);
};

// --- Materials ---
export const fetchMaterials = async (config: SupabaseConfig): Promise<Material[]> => {
  const allItems: Material[] = [];
  let rangeStart = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`${config.url}materials?select=*&order=name.asc`, {
      headers: { ...getHeaders(config), Range: `${rangeStart}-${rangeStart + pageSize - 1}` },
    });
    if (!res.ok) throw new Error(`خطا در دریافت متریال‌ها (${res.status})`);
    const data = await res.json();
    allItems.push(...data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      rangeStart += pageSize;
    }
  }
  return allItems;
};

export const insertMaterial = async (config: SupabaseConfig, name: string, unitPrice: number): Promise<Material> => {
  const res = await fetch(`${config.url}materials`, {
    method: 'POST',
    headers: { ...getHeaders(config), Prefer: 'return=representation' },
    body: JSON.stringify({ name, unit_price: unitPrice }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`خطا در ثبت متریال: ${res.status} - ${err}`);
  }
  const data = await res.json();
  return data[0];
};

export const updateMaterial = async (config: SupabaseConfig, id: string, name: string, unitPrice: number): Promise<void> => {
  const res = await fetch(`${config.url}materials?id=eq.${id}`, {
    method: 'PATCH',
    headers: getHeaders(config),
    body: JSON.stringify({ name, unit_price: unitPrice }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`خطا در ویرایش متریال: ${res.status} - ${err}`);
  }
};

export const deleteMaterial = async (config: SupabaseConfig, id: string): Promise<void> => {
  try {
    await fetch(`${config.url}bom?material_id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(config),
    });
  } catch (e) {
    console.warn('Optional cascading BOM delete skipped', e);
  }
  const res = await fetch(`${config.url}materials?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(config),
  });
  if (!res.ok) throw new Error(`خطا در حذف متریال (${res.status})`);
};

// --- BOM Items ---
export const fetchBomItems = async (config: SupabaseConfig): Promise<BomItem[]> => {
  const allItems: BomItem[] = [];
  let rangeStart = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`${config.url}bom?select=*,box_models(*),materials(*)`, {
      headers: { ...getHeaders(config), Range: `${rangeStart}-${rangeStart + pageSize - 1}` },
    });
    if (!res.ok) throw new Error(`خطا در دریافت جدول BOM (${res.status})`);
    const data = await res.json();
    allItems.push(...data);
    if (data.length < pageSize) {
      hasMore = false;
    } else {
      rangeStart += pageSize;
    }
  }
  return allItems;
};

export const upsertBomItem = async (config: SupabaseConfig, modelId: string, materialId: string, quantity: number): Promise<void> => {
  const checkRes = await fetch(`${config.url}bom?model_id=eq.${modelId}&material_id=eq.${materialId}&select=*`, {
    headers: getHeaders(config),
  });
  const existing: BomItem[] = await checkRes.json();

  if (existing && existing.length > 0 && existing[0].id) {
    const res = await fetch(`${config.url}bom?id=eq.${existing[0].id}`, {
      method: 'PATCH',
      headers: getHeaders(config),
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error(`خطا در بروزرسانی مقدار مصرف (${res.status})`);
  } else {
    const res = await fetch(`${config.url}bom`, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({ model_id: modelId, material_id: materialId, quantity }),
    });
    if (!res.ok) throw new Error(`خطا در ثبت ردیف جدید BOM (${res.status})`);
  }
};

export const batchUpsertBom = async (config: SupabaseConfig, capacity: number, materialId: string, quantity: number): Promise<number> => {
  const modelsRes = await fetch(`${config.url}box_models?capacity=eq.${capacity}&select=*`, {
    headers: getHeaders(config),
  });
  const models: BoxModel[] = await modelsRes.json();
  if (!models || models.length === 0) {
    throw new Error(`هیچ مدل باکسی با ظرفیت ${capacity} دستگاه ماینر در سیستم پیدا نشد.`);
  }

  let count = 0;
  for (const model of models) {
    if (model.id) {
      await upsertBomItem(config, model.id, materialId, quantity);
      count++;
    }
  }
  return count;
};

export const deleteBomItem = async (config: SupabaseConfig, id: string): Promise<void> => {
  const res = await fetch(`${config.url}bom?id=eq.${id}`, {
    method: 'DELETE',
    headers: getHeaders(config),
  });
  if (!res.ok) throw new Error(`خطا در حذف آیتم فرمول (${res.status})`);
};
