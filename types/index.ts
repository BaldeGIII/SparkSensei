export enum AIProviderType {
  CLAUDE = 'claude',
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

export interface AnalysisResult {
  diagnosis: string;
  details: string;
  fix: string;
  senseiNote: string;
  rawResponse?: string;
}

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey: string;
}

export interface StorageKeys {
  PROVIDER_TYPE: string;
  API_KEY_CLAUDE: string;
  API_KEY_OPENAI: string;
  API_KEY_GEMINI: string;
}

export const STORAGE_KEYS: StorageKeys = {
  PROVIDER_TYPE: '@spark_sensei_provider_type',
  API_KEY_CLAUDE: '@spark_sensei_api_key_claude',
  API_KEY_OPENAI: '@spark_sensei_api_key_openai',
  API_KEY_GEMINI: '@spark_sensei_api_key_gemini',
};
