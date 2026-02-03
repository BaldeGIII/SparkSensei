# Quick Start Guide

Get Spark Sensei running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the App

```bash
npm start
```

This will start the Expo development server and show a QR code.

## Step 3: Run on Device

### Option A: Mobile Device (Recommended for testing camera)
1. Install **Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

### Option B: Simulator/Emulator
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal
- **Web Browser**: Press `w` in terminal

## Step 4: Configure API Key

1. Tap the ⚙️ settings icon
2. Select your AI provider (Claude, ChatGPT, or Gemini)
3. Enter your API key:
   - **Claude**: Get from [console.anthropic.com](https://console.anthropic.com)
   - **OpenAI**: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Gemini**: Get from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
4. Tap "Save Settings"

## Step 5: Test the App

### Test with Hardware Image
1. Take or upload a photo of a breadboard circuit
2. Tap "🔍 Analyze"
3. Review the analysis (components, wiring, issues)

### Test with Code Screenshot
1. Take or upload a screenshot of code
2. Tap "🔍 Analyze"
3. Review the analysis (language, bugs, fixes)

## Common Issues

### "Metro Bundler failed to start"
```bash
# Clear cache and restart
npx expo start -c
```

### "Cannot connect to development server"
- Ensure phone and computer are on the same WiFi network
- Try running: `npx expo start --tunnel`

### "Camera/Gallery not working"
- Check app permissions in device settings
- On iOS: Settings > Spark Sensei > Photos/Camera
- On Android: Settings > Apps > Spark Sensei > Permissions

### "Analysis failed"
- Verify your API key is correct
- Check internet connection
- Ensure you have API credits remaining

## Development Commands

```bash
# Start with cache cleared
npm start -- --clear

# Run TypeScript type checking
npx tsc --noEmit

# View logs
npx expo start --dev-client
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check the [Verification Plan](#verification-checklist) below
- Explore the codebase structure in `README.md`

## Verification Checklist

Use this checklist to verify all features work:

### Setup
- [ ] App installs and runs
- [ ] Navigation to Settings works
- [ ] Can select each AI provider
- [ ] Can enter and save API keys
- [ ] Settings persist after app restart

### Image Input
- [ ] Camera permission requested properly
- [ ] Can capture photo with camera
- [ ] Gallery permission requested properly
- [ ] Can select from gallery
- [ ] Selected image displays correctly

### Analysis
- [ ] Can analyze hardware image (breadboard, circuit)
- [ ] Results show proper structure (🛑 🔍 💡 🎓)
- [ ] Can analyze code screenshot
- [ ] Code analysis includes language and fixes
- [ ] Loading indicator shows during analysis
- [ ] Can clear and select new image

### Error Handling
- [ ] Warning when no API key configured
- [ ] Error message for invalid API key
- [ ] Graceful handling of network errors
- [ ] Alert when no image selected

### Multi-Provider
- [ ] Can switch between providers
- [ ] Each provider returns proper analysis
- [ ] Settings save per provider

All done! 🎉
