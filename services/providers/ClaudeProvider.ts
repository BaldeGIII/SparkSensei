import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, SPARK_SENSEI_SYSTEM_PROMPT } from '../AIProvider';
import { AnalysisResult } from '../../types';
import { APP_CONFIG } from '../../constants/config';

export class ClaudeProvider extends AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    super(apiKey);
    this.client = new Anthropic({
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
                text: 'Analyze this image according to your protocol, Spark Sensei.',
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
    if (lowerUri.endsWith('.png') || lowerUri.includes('image/png')) return 'image/png';
    if (lowerUri.endsWith('.gif') || lowerUri.includes('image/gif')) return 'image/gif';
    if (lowerUri.endsWith('.webp') || lowerUri.includes('image/webp')) return 'image/webp';
    // Check data URL mime type
    if (uri.startsWith('data:image/')) {
      const match = uri.match(/data:(image\/(png|gif|webp|jpeg))/);
      if (match && match[1]) return match[1] as any;
    }
    return 'image/jpeg'; // Default to JPEG
  }
}
