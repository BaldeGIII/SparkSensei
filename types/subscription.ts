// Subscription tier types
export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro',
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  expiresAt?: string; // ISO date string
  analysisCount: number; // Daily count for free tier
  lastResetDate: string; // ISO date string for daily reset
}

export interface FeatureAccess {
  unlimitedAnalysis: boolean;
  allProviders: boolean;
  webSearch: boolean; // Option 2 - Premium feature
  componentDatabase: boolean; // Option 3 - Premium feature
  analysisHistory: boolean;
  exportPDF: boolean;
  batchAnalysis: boolean;
  circuitSimulation: boolean;
}

// Feature access by tier
export const TIER_FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  [SubscriptionTier.FREE]: {
    unlimitedAnalysis: false, // 5 per day
    allProviders: false, // OpenAI only
    webSearch: false,
    componentDatabase: false,
    analysisHistory: false,
    exportPDF: false,
    batchAnalysis: false,
    circuitSimulation: false,
  },
  [SubscriptionTier.PREMIUM]: {
    unlimitedAnalysis: true,
    allProviders: true,
    webSearch: true, // Option 2
    componentDatabase: true, // Option 3
    analysisHistory: true,
    exportPDF: true,
    batchAnalysis: false,
    circuitSimulation: false,
  },
  [SubscriptionTier.PRO]: {
    unlimitedAnalysis: true,
    allProviders: true,
    webSearch: true,
    componentDatabase: true,
    analysisHistory: true,
    exportPDF: true,
    batchAnalysis: true,
    circuitSimulation: true,
  },
};

export const TIER_PRICING = {
  [SubscriptionTier.PREMIUM]: {
    monthly: 6.99,
    yearly: 49.99,
  },
  [SubscriptionTier.PRO]: {
    monthly: 14.99,
    yearly: 99.99,
  },
};
