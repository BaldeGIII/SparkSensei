// App Configuration Constants

export const APP_CONFIG = {
  // App Info
  APP_NAME: 'Spark Sensei',
  APP_VERSION: '1.0.0',

  // AI Model Settings
  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',
  OPENAI_MODEL: 'gpt-4-vision-preview',
  GEMINI_MODEL: 'gemini-1.5-pro',

  // API Settings
  MAX_TOKENS: 1024,
  IMAGE_QUALITY: 0.8,
  IMAGE_ASPECT_RATIO: [4, 3] as [number, number],

  // UI Settings
  LOADING_MESSAGES: [
    'Sensei is analyzing your image...',
    'Examining components...',
    'Checking connections...',
    'Identifying issues...',
  ],

  // URLs
  API_KEY_URLS: {
    CLAUDE: 'https://console.anthropic.com',
    OPENAI: 'https://platform.openai.com/api-keys',
    GEMINI: 'https://makersuite.google.com/app/apikey',
  },
};

export const COLORS = {
  PRIMARY: '#007AFF',
  DANGER: '#FF3B30',
  WARNING: '#FF9500',
  SUCCESS: '#34C759',
  BACKGROUND: '#F5F5F5',
  WHITE: '#FFF',
  TEXT_PRIMARY: '#333',
  TEXT_SECONDARY: '#666',
  TEXT_HINT: '#999',
  BORDER: '#E0E0E0',
};
