import { AIProviderType } from '../types';
import { IAIProvider } from './AIProvider';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';

export class AIProviderFactory {
  static createProvider(providerType: AIProviderType, apiKey: string): IAIProvider {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    switch (providerType) {
      case AIProviderType.CLAUDE:
        return new ClaudeProvider(apiKey);
      case AIProviderType.OPENAI:
        return new OpenAIProvider(apiKey);
      case AIProviderType.GEMINI:
        return new GeminiProvider(apiKey);
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }
}
