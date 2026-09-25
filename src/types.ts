export interface BoxModel {
  id?: string;
  capacity: number;
  panel_type: string;
}

export interface Material {
  id?: string;
  name: string;
  unit_price: number;
}

export interface BomItem {
  id?: string;
  model_id?: string;
  material_id?: string;
  quantity: number;
  box_models?: BoxModel;
  materials?: Material;
}

export interface SupabaseConfig {
  url: string;
  apiKey: string;
}

export type ActiveTab = 'models' | 'materials' | 'bom' | 'database' | 'guide' | 'cabinet' | 'ai_scanner';
