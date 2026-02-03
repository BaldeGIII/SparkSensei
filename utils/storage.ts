import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIProviderType, STORAGE_KEYS } from '../types';

export const storage = {
  // Provider Type
  async saveProviderType(providerType: AIProviderType): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PROVIDER_TYPE, providerType);
  },

  async getProviderType(): Promise<AIProviderType | null> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.PROVIDER_TYPE);
    return value as AIProviderType | null;
  },

  // API Keys
  async saveApiKey(providerType: AIProviderType, apiKey: string): Promise<void> {
    const key = this.getApiKeyStorageKey(providerType);
    await AsyncStorage.setItem(key, apiKey);
  },

  async getApiKey(providerType: AIProviderType): Promise<string | null> {
    const key = this.getApiKeyStorageKey(providerType);
    return await AsyncStorage.getItem(key);
  },

  async deleteApiKey(providerType: AIProviderType): Promise<void> {
    const key = this.getApiKeyStorageKey(providerType);
    await AsyncStorage.removeItem(key);
  },

  // Helper
  getApiKeyStorageKey(providerType: AIProviderType): string {
    switch (providerType) {
      case AIProviderType.CLAUDE:
        return STORAGE_KEYS.API_KEY_CLAUDE;
      case AIProviderType.OPENAI:
        return STORAGE_KEYS.API_KEY_OPENAI;
      case AIProviderType.GEMINI:
        return STORAGE_KEYS.API_KEY_GEMINI;
      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROVIDER_TYPE,
      STORAGE_KEYS.API_KEY_CLAUDE,
      STORAGE_KEYS.API_KEY_OPENAI,
      STORAGE_KEYS.API_KEY_GEMINI,
    ]);
  },
};
