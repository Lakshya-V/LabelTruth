import { OCR_API_KEY, OCR_PROVIDER } from './apiConfig';
import * as ImageManipulator from 'expo-image-manipulator';


export type OCRResult = {
  rawText: string;
  ingredients: string[];
};

/**
 * Helper to convert local image URI to base64 string using standard web/React Native APIs.
 * Used when communicating with providers requiring base64 (e.g. Google Cloud Vision).
 */
async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Invokes OCR.space REST API using standard Expo Go multipart/form-data.
 * Runs completely over HTTP without native modules.
 */



async function recognizeWithOCRSpace(
  imageUri: string,
  apiKey: string
): Promise<string> {
  console.log('OCR: converting image to base64...');
  console.log('OCR image URI:', imageUri);

  let base64Image: string;
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: 1600,
          },
        },
      ],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('OCR resized image:', manipulatedImage.uri);

    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();

    const rawDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;

        if (!result) {
          reject(new Error('Image conversion returned no data.'));
          return;
        }

        resolve(result);
      };

      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64.'));
      };

      reader.readAsDataURL(blob);
    });

    // FileReader may give us an incorrect MIME type in React Native.
    // OCR.space requires a valid image data URI.
    const base64Data = rawDataUrl.includes(',')
      ? rawDataUrl.split(',')[1]
      : rawDataUrl;

    if (!base64Data) {
      throw new Error('Image contained no base64 data.');
    }

    // Explicitly tell OCR.space that this is a JPEG image.
    base64Image = `data:image/jpeg;base64,${base64Data}`;

    console.log('OCR: valid JPEG data URI created.');
    console.log(
      'OCR: base64 length:',
      base64Data.length
    );
  } catch (err: any) {
    console.error('IMAGE CONVERSION ERROR:', err);

    throw new Error(
      `Could not read the selected image: ${err?.message || 'Unknown image error'
      }`
    );
  }

  console.log('OCR: image converted successfully.');
  console.log('OCR: sending base64 image to OCR.space...');

  let response: Response;

  try {
    response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:
        `apikey=${encodeURIComponent(apiKey)}` +
        `&language=eng` +
        `&isOverlayRequired=false` +
        `&detectOrientation=true` +
        `&scale=true` +
        `&OCREngine=2` +
        `&base64Image=${encodeURIComponent(base64Image)}`,
    });
  } catch (err: any) {
    console.error('OCR REQUEST ERROR:', err);

    throw new Error(
      `OCR request failed: ${err?.message || 'Unknown network error'
      }`
    );
  }

  console.log('OCR HTTP STATUS:', response.status);

  const responseText = await response.text();

  console.log('OCR RESPONSE:', responseText);

  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      'OCR service returned an invalid response.'
    );
  }

  if (!response.ok) {
    const errorMessage =
      data?.ErrorMessage ||
      data?.error ||
      data?.message ||
      `HTTP ${response.status}`;

    throw new Error(
      `OCR.space error: ${errorMessage}`
    );
  }

  if (data.IsErroredOnProcessing) {
    const errorMsg = Array.isArray(data.ErrorMessage)
      ? data.ErrorMessage.join(' ')
      : String(
        data.ErrorMessage ||
        data.error ||
        'OCR processing failed.'
      );

    console.error('OCR PROCESSING ERROR:', errorMsg);

    if (
      errorMsg.toLowerCase().includes('overloaded') ||
      errorMsg.toLowerCase().includes('throttled')
    ) {
      throw new Error(
        'OCR service is currently busy. Please try again in a moment.'
      );
    }

    throw new Error(
      `OCR.space processing error: ${errorMsg}`
    );
  }

  if (!data.ParsedResults?.length) {
    throw new Error(
      'OCR returned no readable text. Please retake the photo with the ingredients clearly visible.'
    );
  }

  const rawText = data.ParsedResults
    .map((result: any) => result.ParsedText || '')
    .join('\n')
    .trim();

  if (!rawText) {
    throw new Error(
      'OCR returned no readable text. Please retake the photo with the ingredients clearly visible.'
    );
  }

  console.log('OCR SUCCESS:', rawText);

  return rawText;
}





/**
 * Invokes Google Cloud Vision REST API using base64 payload.
 * Runs completely over HTTP without native modules.
 */
async function recognizeWithGoogleVision(imageUri: string, apiKey: string): Promise<string> {
  const base64Image = await uriToBase64(imageUri);

  let response: Response;
  try {
    response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    });
  } catch {
    throw new Error("Couldn't connect to the OCR service. Check your internet connection and try again.");
  }

  if (!response.ok) {
    throw new Error(`Google Vision OCR failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText =
    data.responses?.[0]?.fullTextAnnotation?.text ||
    data.responses?.[0]?.textAnnotations?.[0]?.description ||
    '';

  if (!rawText.trim()) {
    throw new Error('Unable to read the label. Please retake the photo with the ingredients clearly visible.');
  }

  return rawText.trim();
}

export const ocrService = {
  /**
   * Performs HTTP-based frontend OCR on the provided image URI.
   * Completely compatible with standard Expo Go on physical iOS and Android devices.
   * Does NOT use any native modules or require custom builds.
   *
   * @param imageUri Local image URI from camera or photo gallery
   * @returns Raw OCR text containing ingredients, additives, and E-numbers
   */
  async extractTextFromImage(imageUri: string): Promise<string> {
    try {
      const apiKey = OCR_API_KEY;
      const isGoogle = OCR_PROVIDER.toLowerCase() === 'google' || apiKey.startsWith('AIza');

      let rawText = '';
      if (isGoogle) {
        rawText = await recognizeWithGoogleVision(imageUri, apiKey);
      } else {
        rawText = await recognizeWithOCRSpace(imageUri, apiKey);
      }

      console.log('OCR complete');
      return rawText;
    } catch (e: any) {
      console.error('OCR failed:', e);
      // Preserve specific, friendly error messages
      if (
        e.message &&
        (e.message.includes("Couldn't connect") ||
          e.message.includes('Unable to read') ||
          e.message.includes('busy') ||
          e.message.includes('ingredient'))
      ) {
        throw e;
      }
      throw new Error('Unable to read the label. Please retake the photo with the ingredients clearly visible.');
    }
  },

  /**
   * Attempts to parse raw OCR text into an array of ingredients.
   * Matches explicit "Ingredients:" sections, or falls back to comma-separated list
   * if the user took a close-up photo of the ingredients directly.
   *
   * Note: The complete raw OCR text remains the ultimate source of truth sent to the backend.
   *
   * @param rawText The raw text from OCR
   * @returns array of ingredient strings, or empty array if no clear ingredients found
   */
  parseIngredients(rawText: string): string[] {
    // 1. Find the ingredients section
    // Matches "Ingredients:", "INGREDIENTS -", "Ingredients.", "INGREDIENTS\n", etc.
    const ingredientsRegex = /ingredients?[\s.:=\-_]+([\s\S]*)/i;
    const match = rawText.match(ingredientsRegex);

    let ingredientsSection = '';

    if (match && match[1]) {
      ingredientsSection = match[1];

      // Stop words: some labels have other sections after ingredients like "Contains:", "Allergy Advice:" etc.
      const stopWords = /contains:|allergy advice:|manufactured by:|distributed by:|store in a|best before|nutrition information|nutritional information|nutrition facts|mfd\.|mfd\s|packed by|net quantity|net wt/i;
      const stopMatch = ingredientsSection.match(stopWords);
      if (stopMatch && stopMatch.index !== undefined) {
        ingredientsSection = ingredientsSection.substring(0, stopMatch.index);
      }
    } else {
      // Fallback: If no explicit "Ingredients:" header is found, but the text is a list
      // of items separated by commas or newlines, use the whole text.
      ingredientsSection = rawText;
    }

    // 2. Clean up whitespace
    let cleaned = ingredientsSection.replace(/\r?\n/g, ' ');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

    // 3. Split into individual ingredients using parenthesis-depth-aware splitting.
    //    Only split at commas when depth is 0, so nested sub-ingredients like
    //    "(Rice Meal (44%), Corn Meal (23%))" stay together.
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (char === '(' || char === '[' || char === '{') {
        depth++;
        current += char;
      } else if (char === ')' || char === ']' || char === '}') {
        if (depth > 0) depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        if (current.trim()) parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts
      .map((p) => p.replace(/\.+$/, '').trim()) // remove trailing period
      .filter((p) => p.length > 0 && p.toLowerCase() !== 'and');
  },
};
