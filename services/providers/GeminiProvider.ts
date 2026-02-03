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
      // Read image as base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Determine media type from URI
      const mimeType = this.getMimeType(imageUri);

      // Get the generative model
      const model = this.client.getGenerativeModel({
        model: APP_CONFIG.GEMINI_MODEL,
        systemInstruction: SPARK_SENSEI_SYSTEM_PROMPT,
      });

      // Call Gemini API with vision
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        'Analyze this image according to your protocol.',
      ]);

      const response = await result.response;
      const responseText = response.text();

      // Parse the structured response
      return this.parseAnalysisResponse(responseText);
    } catch (error) {
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
