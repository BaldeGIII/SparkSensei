import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, SPARK_SENSEI_SYSTEM_PROMPT } from '../AIProvider';
import { AnalysisResult } from '../../types';
import { APP_CONFIG } from '../../constants/config';
import * as FileSystem from 'expo-file-system';

export class ClaudeProvider extends AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new Anthropic({
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

      // Call Claude API with vision
      const message = await this.client.messages.create({
        model: APP_CONFIG.CLAUDE_MODEL,
        max_tokens: APP_CONFIG.MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Analyze this image according to your protocol.',
              },
            ],
          },
        ],
        system: SPARK_SENSEI_SYSTEM_PROMPT,
      });

      // Extract text from response
      const responseText = message.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as any).text)
        .join('\n');

      // Parse the structured response
      return this.parseAnalysisResponse(responseText);
    } catch (error) {
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getMediaType(uri: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
    const lowerUri = uri.toLowerCase();
    if (lowerUri.endsWith('.png')) return 'image/png';
    if (lowerUri.endsWith('.gif')) return 'image/gif';
    if (lowerUri.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg'; // Default to JPEG
  }
}
