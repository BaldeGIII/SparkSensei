import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, SPARK_SENSEI_SYSTEM_PROMPT } from '../AIProvider';
import { AnalysisResult } from '../../types';
import { APP_CONFIG } from '../../constants/config';
import * as FileSystem from 'expo-file-system';

export class GeminiProvider extends AIProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    try {
      console.log('[GeminiProvider] Starting analysis for:', imageUri);

      // Read image as base64
      console.log('[GeminiProvider] Reading file as base64...');
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      console.log('[GeminiProvider] File read successfully, size:', base64Image.length);

      // Determine media type from URI
      const mimeType = this.getMimeType(imageUri);

      // Get the generative model
      console.log('[GeminiProvider] Creating generative model...');
      const model = this.client.getGenerativeModel({
        model: APP_CONFIG.GEMINI_MODEL,
        systemInstruction: SPARK_SENSEI_SYSTEM_PROMPT,
      });

      // Call Gemini API with vision
      console.log('[GeminiProvider] Calling Gemini API...');
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        'Analyze this image according to your protocol.',
      ]);

      console.log('[GeminiProvider] API call successful, getting response...');
      const response = await result.response;
      const responseText = response.text();
      console.log('[GeminiProvider] Response text:', responseText.substring(0, 100) + '...');

      // Parse the structured response
      console.log('[GeminiProvider] Parsing response...');
      const parsedResult = this.parseAnalysisResponse(responseText);
      console.log('[GeminiProvider] Analysis complete!');
      return parsedResult;
    } catch (error) {
      console.error('[GeminiProvider] Error occurred:', error);
      console.error('[GeminiProvider] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        error: error,
      });
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getMimeType(uri: string): string {
    const lowerUri = uri.toLowerCase();
    if (lowerUri.endsWith('.png')) return 'image/png';
    if (lowerUri.endsWith('.gif')) return 'image/gif';
    if (lowerUri.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg'; // Default to JPEG
  }
}
