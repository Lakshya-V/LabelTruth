import { UserProfile, BarcodeScanResult, ImageScanResult, HistoryEntry } from '../types';

export const mockUser: UserProfile = {
  user_id: 1,
  email: "user@example.com",
  dietary_condition: "Diabetic"
};

export const mockLoginResponse = {
  status: "success",
  ...mockUser
};

export const mockRegisterResponse = {
  status: "success",
  user_id: 1,
  email: "user@example.com"
};

export const mockBarcodeData: BarcodeScanResult = {
  source: "Barcode API",
  product_name: "Nutella",
  nova_upf_level: 4,
  ingredients: "Sugar, Palm Oil, Hazelnuts (13%), Skimmed Milk Powder, Fat-reduced Cocoa, Soy Lecithin, Vanillin",
  flagged_additives: [
    {
      name: "Soy Lecithin (E322)",
      risk: "Low",
      note: "Common emulsifier used to stabilize texture."
    },
    {
      name: "Vanillin (Synthetic)",
      risk: "Low-Mod",
      note: "Artificial flavouring substitute."
    }
  ],
  overall_score: 48,
  badge_color: "AMBER",
  personalized_warning: "This product may be relevant to your selected dietary profile.",
  greenwashing_alert: null,
  swap_item: null,
  approx_cost: null,
  benefit: null,
};

export const mockImageScanData: ImageScanResult = {
  product_type: "Breakfast Cereal",
  extracted_ingredients: [
    "Whole Grain Oats",
    "Sugar",
    "Maltodextrin",
    "Salt"
  ],
  hidden_sugars_found: [
    "Maltodextrin"
  ],
  e_numbers_found: [
    "E102"
  ],
  estimated_nova_level: 4,
  greenwashing_claims_detected: [
    "100% Natural Whole Grain"
  ],
  verdict_summary: "Ultra-processed product containing ingredients that deserve closer attention.",
  overall_score: 36,
  badge_color: "RED",
  personalized_warning: "Ingredients may be relevant to your selected dietary profile.",
  greenwashing_alert: "\"100% Natural Whole Grain\" claim may be misleading.",
  swap_item: "Roasted Chana & Jaggery",
  approx_cost: "₹15",
  benefit: "3x Protein, GI index < 30",
};

export let mockHistory: HistoryEntry[] = [
  { id: '1', name: 'Nutella', productName: 'Nutella', score: 48, badgeColor: 'AMBER', date: 'Today, 10:42 AM', scannedAt: new Date().toISOString(), novaLevel: 4, scanType: 'barcode' },
  { id: '2', name: 'Breakfast Cereal', productName: 'Breakfast Cereal', score: 36, badgeColor: 'RED', date: 'Yesterday', scannedAt: new Date(Date.now() - 86400000).toISOString(), novaLevel: 4, scanType: 'image' },
  { id: '3', name: 'Oat Milk', productName: 'Oat Milk', score: 85, badgeColor: 'GREEN', date: 'Oct 12', scannedAt: new Date(Date.now() - 172800000).toISOString(), novaLevel: 1, scanType: 'barcode' },
];

