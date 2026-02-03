# Spark Sensei - Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [x] TypeScript compilation passes (`npm run typecheck`)
- [x] No runtime errors in development
- [x] All components properly typed
- [x] Error handling implemented

### Features
- [x] Camera image capture
- [x] Gallery image selection
- [x] AI analysis (Claude, ChatGPT, Gemini)
- [x] Settings persistence
- [x] Navigation working
- [x] Loading states
- [x] Error messages

### Documentation
- [x] README.md with full documentation
- [x] QUICKSTART.md with setup guide
- [x] IMPLEMENTATION_SUMMARY.md with technical details
- [x] Code comments where needed

## Development Testing

### Local Testing (Expo Go)
```bash
npm install
npm start
```

Scan QR code with Expo Go app to test on real device.

### Test Cases to Verify

1. **Settings Screen**
   - [ ] Can navigate to settings
   - [ ] Can select each provider
   - [ ] Can enter API keys
   - [ ] Settings save correctly
   - [ ] Settings persist after restart

2. **Image Selection**
   - [ ] Camera permission requested
   - [ ] Can capture photo
   - [ ] Gallery permission requested
   - [ ] Can select from gallery
   - [ ] Image displays correctly

3. **Analysis**
   - [ ] Analysis works with Claude
   - [ ] Analysis works with ChatGPT
   - [ ] Analysis works with Gemini
   - [ ] Results formatted correctly
   - [ ] Loading indicator shows

4. **Error Handling**
   - [ ] Warns when no API key
   - [ ] Handles invalid API key
   - [ ] Handles network errors
   - [ ] Handles invalid images

## Building for Production

### iOS (App Store)

#### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode installed
- EAS CLI installed: `npm install -g eas-cli`

#### Build Steps
```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

#### App Store Requirements
- App name: "Spark Sensei"
- Description: (see app.json)
- Keywords: electronics, code, AI, education, hardware, debugging
- Category: Education / Developer Tools
- Privacy Policy: (required - create one)
- Screenshots: (5 required)

### Android (Google Play)

#### Prerequisites
- Google Play Developer Account ($25 one-time)
- EAS CLI installed

#### Build Steps
```bash
# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

#### Google Play Requirements
- App name: "Spark Sensei"
- Short description: (max 80 chars)
- Full description: (see app.json)
- Category: Education
- Privacy Policy: (required - create one)
- Screenshots: (min 2 required)

### Web Deployment

#### Build for Web
```bash
npm run web

# Or build static files
npx expo export:web
```

#### Deploy to Vercel/Netlify
```bash
# Deploy dist folder to your hosting service
# Configure redirects for SPA routing
```

## Environment Configuration

### API Keys
Users enter their own API keys in the app. No server-side keys needed.

### App Configuration
Edit `constants/config.ts` to modify:
- Model names
- Token limits
- UI constants
- Colors

## Privacy & Security

### Privacy Policy Required Content
Your app collects:
- Camera photos (processed locally, sent to AI APIs)
- Gallery photos (processed locally, sent to AI APIs)
- API keys (stored locally on device)

Data is:
- NOT stored on servers
- Sent only to selected AI provider (Claude/OpenAI/Google)
- Stored locally using AsyncStorage (encrypted by OS)

### Security Best Practices
- [x] API keys stored in AsyncStorage (device-encrypted)
- [x] No API keys in code
- [x] HTTPS only for API calls
- [x] No analytics/tracking by default

## Marketing Assets Needed

### Screenshots (5-8 recommended)
1. Home screen with "Take Photo" buttons
2. Image selected, ready to analyze
3. Analysis results showing all 4 sections
4. Settings screen with provider selection
5. Hardware analysis example
6. Code analysis example

### App Icon
- 1024x1024 PNG (iOS)
- Adaptive icon (Android)
- Current placeholder at `assets/icon.png`

### Feature Graphic (Android)
- 1024x500 PNG
- Shows app name and key features

## App Store Descriptions

### Short Description (80 chars)
"AI-powered electronics and code debugging with Spark Sensei"

### Full Description
```
⚡ Spark Sensei - Your AI Electronics & Code Mentor

Snap a photo of your circuit or code, and get instant expert analysis from Spark Sensei, your strict but knowledgeable professor.

🔍 WHAT IT ANALYZES:
• Electronics: Breadboards, PCBs, wiring, components
• Code: Python, C++, JavaScript, Arduino, and more

🤖 MULTIPLE AI PROVIDERS:
• Claude (Anthropic)
• ChatGPT (OpenAI)
• Gemini (Google)
Choose your preferred AI and enter your API key.

✨ STRUCTURED FEEDBACK:
• 🛑 Diagnosis: What's wrong
• 🔍 Details: Deep dive into the issue
• 💡 The Fix: How to solve it
• 🎓 Sensei's Note: Learn from your mistakes

Perfect for:
• Students learning electronics
• Developers debugging code
• Makers troubleshooting projects
• Anyone wanting to learn from their mistakes

No subscription required - use your own AI API key!
```

## Post-Launch

### Monitoring
- Watch for crash reports
- Monitor API usage costs (user's responsibility)
- Check user reviews
- Gather feedback

### Future Updates
- Add analysis history
- Support more AI providers
- Implement dark mode
- Add sharing features

## Support

### User Support
Create support channels:
- Email: support@sparksensei.app (example)
- GitHub Issues: For bug reports
- FAQ page: Common questions

### Common User Issues

**"Analysis failed"**
- Check API key is correct
- Verify internet connection
- Ensure API credits available

**"Camera not working"**
- Check app permissions in device settings
- Reinstall app if needed

**"API key not saving"**
- Clear app data and re-enter
- Check device storage available

## Legal

### Required Documents
1. **Privacy Policy** - Required by app stores
2. **Terms of Service** - Recommended
3. **License** - MIT (already in repo)

### Third-Party APIs
Users are responsible for:
- Getting their own API keys
- Agreeing to provider's terms
- API usage costs
- Content policy compliance

## Costs

### Development
- [x] Expo: Free
- [x] Development tools: Free

### Deployment
- Apple Developer: $99/year
- Google Play: $25 one-time
- Expo EAS Build: Free tier available (paid for more builds)

### User Costs
Users pay for their own API usage:
- Claude: ~$0.01-0.02 per analysis
- ChatGPT: ~$0.01-0.03 per analysis
- Gemini: ~$0.001-0.01 per analysis

## Timeline

### Development: Complete ✅
- All features implemented
- All documentation written
- TypeScript compilation passing

### Testing: Next Step
- Test on real devices
- Verify all features
- Fix any issues found

### Deployment: Ready When Tested
- Submit to app stores
- Wait for review (1-7 days typically)
- Launch!

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

---

**Ready for testing and deployment!** ⚡
