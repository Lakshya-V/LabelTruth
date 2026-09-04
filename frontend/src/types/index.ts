// Scan mode discriminator
export type ScanMode = 'barcode' | 'image';

// Input types for scan service — ready for backend integration
export type ImageScanInput = {
  imageUri: string;
  userId?: number | null;
  productName: string;
};

export type BarcodeScanInput = {
  barcode: string;
  userId?: number;
};

export type UserProfile = {
  user_id: number;
  email: string;
  dietary_condition: string;
};

export type FlaggedAdditive = {
  name: string;
  risk: string;
  note: string;
};

export type BarcodeScanResult = {
  source: string;
  product_name: string;
  nova_upf_level: number;
  ingredients: string;
  flagged_additives: FlaggedAdditive[];
  health_score?: number;
  eco_impact_score?: number;
  overall_score: number;
  badge_color: string;
  personalized_warning?: string | null;
  greenwashing_alert?: string | null;
  swap_item?: string | null;
  approx_cost?: string | null;
  benefit?: string | null;
};

export type UnifiedScanResult = {
  source?: string;
  product_name?: string;
  ingredients?: string | string[];
  nova_upf_level?: number;
  estimated_nova_level?: number;
  flagged_additives?: FlaggedAdditive[];
  health_score?: number;
  eco_impact_score?: number;
  overall_score?: number;
  badge_color?: string;
  personalized_warning?: string | null;
  greenwashing_alert?: string | null;
  raw_text_received?: string;
  swap_item?: string | null;
  approx_cost?: string | null;
  benefit?: string | null;
};

export type ImageScanResult = {
  // Fields from backend /scan/text
  source?: string;
  raw_text_received?: string;
  estimated_nova_level?: number;
  flagged_additives?: FlaggedAdditive[];
  health_score?: number;
  eco_impact_score?: number;
  overall_score: number;
  badge_color: string;
  personalized_warning?: string | null;
  greenwashing_alert?: string | null;

  // Frontend-merged fields
  product_name?: string;
  ingredients?: string[];

  // Legacy fields — kept for mock/backward compatibility
  product_type?: string;
  extracted_ingredients?: string[];
  hidden_sugars_found?: string[];
  e_numbers_found?: string[];
  greenwashing_claims_detected?: string[];
  verdict_summary?: string;
  swap_item?: string | null;
  approx_cost?: string | null;
  benefit?: string | null;
};

export type HistoryEntry = {
  id: string | number;
  name?: string; // legacy
  productName: string;
  score?: number;
  badgeColor: string;
  date?: string; // legacy
  scannedAt: string;
  novaLevel?: number;
  verdict?: string;
  scanType: 'barcode' | 'image';
  resultData?: ImageScanResult | BarcodeScanResult; // the full result for easy restoration
};
