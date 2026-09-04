import { BarcodeScanInput, ImageScanInput, BarcodeScanResult, ImageScanResult, HistoryEntry } from '@/types';
import { API_BASE_URL } from './apiConfig';
import { storageService } from './storageService';
import { ocrService } from './ocrService';
import { resultStore } from './resultStore';

/**
 * scanService.ts
 *
 * Handles API requests and orchestration for scanning barcodes and images.
 */

// ---------------------------------------------------------------------------
// Barcode scan
// ---------------------------------------------------------------------------

export async function scanBarcode(input: BarcodeScanInput): Promise<BarcodeScanResult> {
  // 1. Check cache — keyed by (barcode, userContext) to prevent cross-user
  //    personalization leakage and to ensure changing dietary condition invalidates
  //    the old cached personalized result. See storageService.KEYS.PRODUCT for rationale.
  let userContext = 'anon';
  if (input.userId != null) {
    const profile = await storageService.getProfile();
    const condition = profile?.dietary_condition || 'none';
    const safeCondition = condition.toLowerCase().replace(/[^a-z0-9]/g, '_');
    userContext = `u${input.userId}_${safeCondition}`;
  }

  const cached = await storageService.getCachedProduct(input.barcode, userContext);
  if (cached) {
    // Cache hit: return immediately without network request.
    // History is added so the hit also appears in the user's scan history.
    await addToHistory({ ...cached, barcode: input.barcode }, 'barcode');
    resultStore.setLatestResult(cached);
    return cached;
  }

  // 2. Cache miss — call backend with this user's identity so the backend can
  //    apply the correct dietary-condition-based personalized_warning.
  const url = `${API_BASE_URL}/scan/barcode/${input.barcode}${input.userId ? `?user_id=${input.userId}` : ''
    }`;

  console.log("BARCODE URL:", url);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Barcode scan failed: ${response.status}`);

  const result = (await response.json()) as BarcodeScanResult;

  // 3. Cache the personalized result under (barcode, userContext)
  await storageService.saveCachedProduct(input.barcode, userContext, result);
  await addToHistory({ ...result, barcode: input.barcode }, 'barcode');
  resultStore.setLatestResult(result);

  return result;
}

// ---------------------------------------------------------------------------
// Label image scan
// ---------------------------------------------------------------------------

export async function scanLabelImage(input: ImageScanInput): Promise<ImageScanResult> {
  console.log('scanLabelImage() start');

  // 1. Perform OCR on the device
  const ocrText = await ocrService.extractTextFromImage(input.imageUri);

  if (!ocrText || ocrText.trim() === '') {
    throw new Error('No text found in the image. Please take a clearer photo.');
  }

  // Check if there's an ingredients section (optional: just for validation before sending to backend)
  const ingredients = ocrService.parseIngredients(ocrText);
  if (ingredients.length === 0) {
    throw new Error('We couldn\'t find an ingredient list in this photo. Please photograph the back of the package where the ingredients are listed.');
  }

  // 2. Send OCR text to backend
  const response = await fetch(`${API_BASE_URL}/scan/text`, {
    method: 'POST',
    body: JSON.stringify({
      ocr_text: ocrText,
      user_id: input.userId || null,
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error(`Image scan failed: ${response.status}`);

  const backendResult = await response.json();
  console.log('backend response received');

  // 3. Merge backend analysis with frontend-derived data
  const result: ImageScanResult = {
    ...backendResult,
    product_name: input.productName,
    ingredients,
    raw_text_received: ocrText,
  };

  console.log('scan result successfully returned');

  // 4. Save to in-memory store & history
  resultStore.setLatestResult(result);
  await addToHistory(result, 'image');

  return result;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

async function addToHistory(result: any, scanType: 'barcode' | 'image'): Promise<void> {
  const historyEntry: HistoryEntry = {
    id: Date.now().toString(),
    productName: result.product_name || result.product_type || 'Unknown Product',
    score: result.overall_score || result.health_score,
    badgeColor: result.badge_color,
    scannedAt: new Date().toISOString(),
    novaLevel: result.nova_upf_level || result.estimated_nova_level,
    verdict: result.verdict_summary,
    scanType,
    resultData: result,
  };

  await storageService.addHistoryEntry(historyEntry);
}
