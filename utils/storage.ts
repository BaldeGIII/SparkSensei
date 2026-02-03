import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIProviderType, STORAGE_KEYS } from '../types';
import { SubscriptionStatus, SubscriptionTier } from '../types/subscription';

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

  // Subscription Management
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default: Free tier
    const today = new Date().toISOString().split('T')[0];
    return {
      tier: SubscriptionTier.FREE,
      analysisCount: 0,
      lastResetDate: today,
    };
  },

  async saveSubscriptionStatus(status: SubscriptionStatus): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(status));
  },

  async incrementAnalysisCount(): Promise<number> {
    const status = await this.getSubscriptionStatus();
    const today = new Date().toISOString().split('T')[0];

    // Reset count if it's a new day
    if (status.lastResetDate !== today) {
      status.analysisCount = 0;
      status.lastResetDate = today;
    }

    status.analysisCount += 1;
    await this.saveSubscriptionStatus(status);
    return status.analysisCount;
  },

  async upgradeToPremium(): Promise<void> {
    const status = await this.getSubscriptionStatus();
    status.tier = SubscriptionTier.PREMIUM;
    // In production, set expiresAt based on payment
    await this.saveSubscriptionStatus(status);
  },

  async upgradeToPro(): Promise<void> {
    const status = await this.getSubscriptionStatus();
    status.tier = SubscriptionTier.PRO;
    // In production, set expiresAt based on payment
    await this.saveSubscriptionStatus(status);
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROVIDER_TYPE,
      STORAGE_KEYS.API_KEY_CLAUDE,
      STORAGE_KEYS.API_KEY_OPENAI,
      STORAGE_KEYS.API_KEY_GEMINI,
      STORAGE_KEYS.SUBSCRIPTION,
    ]);
  },
};
