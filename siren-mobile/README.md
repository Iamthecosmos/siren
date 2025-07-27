# Siren - Safety App (Mobile)

A comprehensive safety and emergency response mobile application built with React Native and Expo, designed to provide users with quick access to emergency features and location sharing capabilities.

## 🚀 Features

### Emergency Features
- **One-tap Emergency Activation** - Immediate emergency contact notification
- **Voice Activation** - Voice-activated emergency triggers
- **Quick Dial** - Fast access to emergency contacts
- **Fake Call** - Simulate incoming calls for safety
- **Emergency Alarm** - Loud alarm sound for attention

### Location Services
- **Live Location Sharing** - Real-time location tracking
- **Emergency Location Broadcast** - Automatic location sharing in emergencies
- **Location History** - Track location sessions
- **Safe Zone Alerts** - Notifications when leaving safe areas

### Voice Features
- **Voice Recognition** - Custom emergency phrase detection
- **Voice Monitoring** - Continuous voice monitoring
- **Sensitivity Controls** - Adjustable voice recognition sensitivity
- **Test Mode** - Practice without triggering real emergencies

### Safety Dashboard
- **Safety Status Overview** - Real-time status of all safety features
- **Quick Actions** - Fast access to common safety features
- **Recent Activity** - Track recent safety events
- **Emergency Contacts** - Manage and prioritize emergency contacts

## 📱 Platforms

- **iOS** - Native iOS app with full feature support
- **Android** - Native Android app with full feature support
- **Web** - Progressive Web App (PWA) support

## 🛠️ Technology Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe development
- **React Navigation** - Navigation and routing
- **Expo Location** - Location services
- **Expo AV** - Audio and video capabilities
- **Expo Haptics** - Haptic feedback
- **Expo Notifications** - Push notifications

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd siren-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📱 App Structure

```
src/
├── screens/           # Main app screens
│   ├── HomeScreen.tsx
│   ├── EmergencyScreen.tsx
│   ├── LocationScreen.tsx
│   ├── VoiceActivationScreen.tsx
│   └── SettingsScreen.tsx
├── components/        # Reusable components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
└── types/            # TypeScript type definitions
```

## 🔧 Configuration

### App Configuration (`app.json`)

The app is configured with the following permissions and features:

- **Location Services** - GPS and network-based location
- **Microphone Access** - Voice activation features
- **Camera Access** - Emergency photo capture
- **Contacts Access** - Emergency contact management
- **SMS/Call Permissions** - Emergency communication

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=your_api_url_here
EXPO_PUBLIC_EMERGENCY_NUMBER=911
```

## 🚀 Building for Production

### iOS Build

1. **Configure iOS settings**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Build for App Store**
   ```bash
   npx expo build:ios
   ```

### Android Build

1. **Configure Android settings**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Build for Play Store**
   ```bash
   npx expo build:android
   ```

## 📱 App Store Deployment

### iOS App Store

1. **Archive the app**
   ```bash
   npx expo build:ios --type archive
   ```

2. **Upload to App Store Connect**
   - Use Xcode or Application Loader
   - Follow Apple's submission guidelines

### Google Play Store

1. **Build APK/AAB**
   ```bash
   npx expo build:android --type app-bundle
   ```

2. **Upload to Google Play Console**
   - Follow Google's submission guidelines
   - Ensure all permissions are properly documented

## 🔒 Security Features

- **Encrypted Data Storage** - All sensitive data is encrypted
- **Secure API Communication** - HTTPS-only API calls
- **Permission Management** - Granular permission controls
- **Privacy Protection** - User data privacy controls

## 🆘 Emergency Features

### Emergency Activation
- One-tap emergency button
- Voice-activated emergency triggers
- Automatic location sharing
- Emergency contact notification

### Location Services
- Real-time GPS tracking
- Location history
- Safe zone monitoring
- Emergency location broadcast

### Communication
- Emergency SMS to contacts
- Emergency phone calls
- Location sharing links
- Emergency alarm sounds

## 🎨 UI/UX Features

- **Dark Theme** - Optimized for low-light conditions
- **Haptic Feedback** - Tactile response for interactions
- **Accessibility** - Screen reader and accessibility support
- **Responsive Design** - Works on all device sizes

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Emergency button functionality
- [ ] Location sharing accuracy
- [ ] Voice activation sensitivity
- [ ] Contact management
- [ ] Settings persistence
- [ ] Permission handling

## 🐛 Troubleshooting

### Common Issues

1. **Location not working**
   - Check device location permissions
   - Ensure GPS is enabled
   - Verify app has location access

2. **Voice activation issues**
   - Check microphone permissions
   - Ensure device supports voice recognition
   - Test in quiet environment

3. **Build errors**
   - Clear cache: `npx expo start --clear`
   - Update dependencies: `npm update`
   - Check Expo SDK version compatibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest features and security patches by:
- Regularly updating the app
- Following the release notes
- Testing new features in development builds

---

**⚠️ Important**: This app is designed for emergency situations. Always ensure you have proper emergency services contact information and understand the limitations of the app in emergency scenarios. 