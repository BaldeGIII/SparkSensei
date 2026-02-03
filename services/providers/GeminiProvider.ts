import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, SPARK_SENSEI_SYSTEM_PROMPT } from '../AIProvider';
import { AnalysisResult } from '../../types';
import { APP_CONFIG } from '../../constants/config';

export class GeminiProvider extends AIProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new GoogleGenerativeAI(this.apiKey);
  }

  async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    try {
      console.log('[GeminiProvider] Starting analysis for:', imageUri);

      // List available models for debugging
      try {
        console.log('[GeminiProvider] Listing available models...');
        const models = await this.client.listModels();
        console.log('[GeminiProvider] Available models:');
        for (const model of models) {
          console.log(`  - ${model.name} (supports: ${model.supportedGenerationMethods.join(', ')})`);
        }
      } catch (listError) {
        console.log('[GeminiProvider] Could not list models:', listError);
      }

      // Read image as base64 (works on both web and mobile)
      console.log('[GeminiProvider] Reading file as base64...');
      const base64Image = await this.readFileAsBase64(imageUri);
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
        'Analyze this image according to your protocol, Spark Sensei.',
      ]);

      console.log('[GeminiProvider] API call successful, getting response...');
      const response = await result.response;
      const responseText = response.text();
      console.log('[GeminiProvider] Response text:', responseText.substring(0, 200) + '...');

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
    if (lowerUri.endsWith('.png') || lowerUri.includes('image/png')) return 'image/png';
    if (lowerUri.endsWith('.gif') || lowerUri.includes('image/gif')) return 'image/gif';
    if (lowerUri.endsWith('.webp') || lowerUri.includes('image/webp')) return 'image/webp';
    // Check data URL mime type
    if (uri.startsWith('data:image/')) {
      const match = uri.match(/data:(image\/[^;]+)/);
      if (match) return match[1];
    }
    return 'image/jpeg'; // Default to JPEG
  }
}
