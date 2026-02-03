import OpenAI from 'openai';
import { AIProvider, SPARK_SENSEI_SYSTEM_PROMPT } from '../AIProvider';
import { AnalysisResult } from '../../types';
import { APP_CONFIG } from '../../constants/config';
import * as FileSystem from 'expo-file-system';

export class OpenAIProvider extends AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    try {
      // Read image as base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Determine media type from URI
      const mediaType = this.getMediaType(imageUri);
      const dataUrl = `data:${mediaType};base64,${base64Image}`;

      // Call OpenAI API with vision
      const response = await this.client.chat.completions.create({
        model: APP_CONFIG.OPENAI_MODEL,
        max_tokens: APP_CONFIG.MAX_TOKENS,
        messages: [
          {
            role: 'system',
            content: SPARK_SENSEI_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
              {
                type: 'text',
                text: 'Analyze this image according to your protocol.',
              },
            ],
          },
        ],
      });

      // Extract text from response
      const responseText = response.choices[0]?.message?.content || '';

      // Parse the structured response
      return this.parseAnalysisResponse(responseText);
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getMediaType(uri: string): string {
    const lowerUri = uri.toLowerCase();
    if (lowerUri.endsWith('.png')) return 'image/png';
    if (lowerUri.endsWith('.gif')) return 'image/gif';
    if (lowerUri.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg'; // Default to JPEG
  }
}
