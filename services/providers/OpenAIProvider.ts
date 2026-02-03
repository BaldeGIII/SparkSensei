import OpenAI from 'openai';
import { AIProvider, SPARK_SENSEI_SYSTEM_PROMPT } from '../AIProvider';
import { AnalysisResult } from '../../types';
import { APP_CONFIG } from '../../constants/config';

export class OpenAIProvider extends AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new OpenAI({
      apiKey: this.apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    try {
      // Read image as base64 (works on both web and mobile)
      const base64Image = await this.readFileAsBase64(imageUri);

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
                text: 'Analyze this image according to your protocol, Spark Sensei.',
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
