# ⚡ Spark Sensei

A React Native mobile app that uses AI vision to analyze electronics hardware and code screenshots, providing structured educational feedback from your strict but knowledgeable mentor, Spark Sensei.

## Features

- 📷 Capture or upload images of electronics or code
- 🤖 Multi-provider AI support (Claude, ChatGPT, Gemini)
- 🔍 Detailed analysis with structured feedback:
  - 🛑 DIAGNOSIS - What's wrong
  - 🔍 DETAILS - In-depth explanation
  - 💡 THE FIX - How to solve it
  - 🎓 SENSEI'S NOTE - Learning tip
- 📱 Cross-platform (iOS, Android, Web)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- An API key from one of:
  - [Anthropic (Claude)](https://console.anthropic.com)
  - [OpenAI (ChatGPT)](https://platform.openai.com/api-keys)
  - [Google (Gemini)](https://makersuite.google.com/app/apikey)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SparkSensei
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - **iOS**: Press `i` or scan QR code with Expo Go
   - **Android**: Press `a` or scan QR code with Expo Go
   - **Web**: Press `w`

## Setup

1. Launch the app
2. Tap the ⚙️ settings icon in the top right
3. Select your preferred AI provider
4. Enter your API key for the selected provider
5. Tap "Save Settings"

## Usage

1. **Capture/Upload Image**:
   - Tap "📷 Take Photo" to capture a new image
   - Tap "🖼️ Choose from Gallery" to select an existing image

2. **Analyze**:
   - Once an image is selected, tap "🔍 Analyze"
   - Wait for Spark Sensei to analyze your image

3. **Review Results**:
   - Read the structured feedback
   - Follow the fix instructions
   - Learn from Sensei's note

4. **Clear and Repeat**:
   - Tap "Clear" to analyze a new image

## Supported Image Types

### Hardware (Electronics)
- Breadboard circuits
- PCB layouts
- Component connections
- Wiring diagrams

### Software (Code)
- Python
- C++
- JavaScript/TypeScript
- Arduino/C
- React Native
- Any programming language

## API Provider Comparison

| Provider | Model | Strengths |
|----------|-------|-----------|
| **Claude** | Sonnet 3.5 | Best for detailed analysis, nuanced explanations |
| **ChatGPT** | GPT-4 Vision | Great all-around performance |
| **Gemini** | Gemini 1.5 Pro | Fast, good for quick feedback |

## Project Structure

```
SparkSensei/
├── App.tsx                    # Main app with navigation
├── screens/
│   ├── HomeScreen.tsx         # Main analysis interface
│   └── SettingsScreen.tsx     # Provider & API key settings
├── components/
│   ├── AnalysisResult.tsx     # Structured result display
│   └── ImagePickerButton.tsx  # Camera/gallery picker
├── services/
│   ├── AIProvider.ts          # Base provider interface
│   ├── AIProviderFactory.ts   # Provider instantiation
│   └── providers/
│       ├── ClaudeProvider.ts  # Anthropic integration
│       ├── OpenAIProvider.ts  # OpenAI integration
│       └── GeminiProvider.ts  # Google integration
├── utils/
│   └── storage.ts             # AsyncStorage wrapper
└── types/
    └── index.ts               # TypeScript definitions
```

## Troubleshooting

### "API Key Required" Error
- Go to Settings and ensure you've entered an API key for your selected provider
- Verify the API key is correct and active

### Image Not Loading
- Check camera/gallery permissions in device settings
- Try selecting a different image

### Analysis Failed
- Check your internet connection
- Verify your API key is valid
- Ensure you have sufficient API credits

### Camera/Gallery Permissions Denied
- iOS: Go to Settings > Spark Sensei > Photos/Camera
- Android: Go to Settings > Apps > Spark Sensei > Permissions

## Development

### Build Commands
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Adding New AI Providers

1. Create provider class in `services/providers/`
2. Implement `IAIProvider` interface
3. Add provider to `AIProviderFactory`
4. Update `AIProviderType` enum in `types/index.ts`
5. Add UI option in `SettingsScreen.tsx`

## License

MIT

## Credits

Built with:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Anthropic Claude API](https://www.anthropic.com/)
- [OpenAI API](https://openai.com/)
- [Google Gemini API](https://ai.google.dev/)
