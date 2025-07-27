# Siren Mobile App - Deployment Guide

This guide will walk you through deploying the Siren mobile app to both iOS App Store and Google Play Store.

## 📱 Prerequisites

### For iOS Deployment
- **Apple Developer Account** ($99/year)
- **Xcode** (latest version)
- **macOS** (required for iOS builds)
- **App Store Connect** access

### For Android Deployment
- **Google Play Console** account ($25 one-time fee)
- **Android Studio** (optional, for local builds)
- **Keystore file** for app signing

## 🚀 Quick Start

### 1. Build the App

```bash
# Install dependencies
npm install

# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

### 2. Test the Build

```bash
# Test on iOS Simulator
npm run ios

# Test on Android Emulator
npm run android

# Test on Web
npm run web
```

## 📱 iOS App Store Deployment

### Step 1: Configure iOS Settings

1. **Update app.json** with your iOS configuration:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.siren",
         "buildNumber": "1.0.0",
         "infoPlist": {
           "NSLocationWhenInUseUsageDescription": "Siren needs location access for emergency features",
           "NSMicrophoneUsageDescription": "Siren needs microphone access for voice activation"
         }
       }
     }
   }
   ```

2. **Generate iOS project**:
   ```bash
   npx expo prebuild --platform ios
   ```

### Step 2: Build for App Store

1. **Archive the app**:
   ```bash
   npx expo build:ios --type archive
   ```

2. **Or build locally**:
   ```bash
   cd ios
   xcodebuild -workspace Siren.xcworkspace -scheme Siren -configuration Release archive -archivePath Siren.xcarchive
   ```

### Step 3: Upload to App Store Connect

1. **Open Xcode** and go to Organizer
2. **Select your archive** and click "Distribute App"
3. **Choose "App Store Connect"**
4. **Follow the upload wizard**
5. **Submit for review** in App Store Connect

### Step 4: App Store Review Process

1. **App Store Connect Setup**:
   - Create app listing
   - Add screenshots and descriptions
   - Set pricing and availability
   - Configure app categories

2. **Submit for Review**:
   - Ensure all required metadata is complete
   - Test the app thoroughly
   - Submit for Apple's review process

## 🤖 Google Play Store Deployment

### Step 1: Configure Android Settings

1. **Update app.json** with your Android configuration:
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.siren",
         "versionCode": 1,
         "permissions": [
           "ACCESS_FINE_LOCATION",
           "RECORD_AUDIO",
           "SEND_SMS",
           "CALL_PHONE"
         ]
       }
     }
   }
   ```

2. **Generate Android project**:
   ```bash
   npx expo prebuild --platform android
   ```

### Step 2: Create Keystore

1. **Generate keystore** (if you don't have one):
   ```bash
   keytool -genkey -v -keystore siren-key.keystore -alias siren -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure keystore in app.json**:
   ```json
   {
     "expo": {
       "android": {
         "buildType": "apk",
         "gradleCommand": ":app:assembleRelease"
       }
     }
   }
   ```

### Step 3: Build for Play Store

1. **Build App Bundle** (recommended):
   ```bash
   npx expo build:android --type app-bundle
   ```

2. **Or build APK**:
   ```bash
   npx expo build:android --type apk
   ```

### Step 4: Upload to Google Play Console

1. **Google Play Console Setup**:
   - Create new app
   - Fill in app details
   - Upload screenshots and descriptions

2. **Upload Build**:
   - Go to "Release" → "Production"
   - Upload your AAB or APK file
   - Add release notes

3. **Submit for Review**:
   - Complete content rating questionnaire
   - Submit for Google's review process

## 🔧 Environment Configuration

### Production Environment

1. **Create production config**:
   ```bash
   # .env.production
   EXPO_PUBLIC_API_URL=https://api.siren.com
   EXPO_PUBLIC_EMERGENCY_NUMBER=911
   EXPO_PUBLIC_APP_ENV=production
   ```

2. **Update app.json**:
   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-project-id"
         }
       }
     }
   }
   ```

### EAS Build (Recommended)

1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   eas build:configure
   ```

4. **Build with EAS**:
   ```bash
   # iOS
   eas build --platform ios

   # Android
   eas build --platform android

   # Both
   eas build --platform all
   ```

## 📋 Pre-Deployment Checklist

### iOS Checklist
- [ ] App icon and splash screen configured
- [ ] Bundle identifier is unique
- [ ] Version and build numbers set
- [ ] Privacy policy URL added
- [ ] App Store screenshots prepared
- [ ] App description and keywords written
- [ ] Required permissions documented
- [ ] App tested on multiple iOS devices
- [ ] Accessibility features implemented

### Android Checklist
- [ ] App icon and adaptive icon configured
- [ ] Package name is unique
- [ ] Version code and name set
- [ ] Privacy policy URL added
- [ ] Play Store screenshots prepared
- [ ] App description and keywords written
- [ ] Required permissions documented
- [ ] App tested on multiple Android devices
- [ ] Content rating questionnaire completed

### General Checklist
- [ ] Emergency features tested thoroughly
- [ ] Location services working correctly
- [ ] Voice activation functioning
- [ ] Contact management working
- [ ] Settings persistence verified
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Offline functionality tested
- [ ] Performance optimized
- [ ] Security measures implemented

## 🚨 Emergency App Considerations

### Legal Requirements
- **Emergency Services Disclaimer**: Clearly state app limitations
- **Privacy Policy**: Comprehensive privacy policy required
- **Terms of Service**: Legal terms for emergency app usage
- **Liability Waiver**: Protect against misuse claims

### App Store Guidelines
- **Emergency Category**: Submit under appropriate category
- **Content Rating**: Ensure appropriate age rating
- **Permission Justification**: Clear explanation for all permissions
- **Emergency Features**: Document emergency functionality

### Testing Requirements
- **Emergency Button**: Test emergency activation flow
- **Location Accuracy**: Verify GPS accuracy
- **Voice Recognition**: Test voice activation reliability
- **Contact Integration**: Test emergency contact features
- **Offline Functionality**: Test without internet connection

## 🔄 Continuous Deployment

### Automated Builds

1. **GitHub Actions** (example):
   ```yaml
   name: Build and Deploy
   on:
     push:
       tags:
         - 'v*'
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm install
         - run: npx expo build:ios
         - run: npx expo build:android
   ```

2. **EAS Update** for over-the-air updates:
   ```bash
   eas update --branch production --message "Emergency fix"
   ```

### Version Management

1. **Semantic Versioning**:
   - Major.Minor.Patch (e.g., 1.0.0)
   - Update version in app.json
   - Tag releases in Git

2. **Changelog**:
   - Maintain CHANGELOG.md
   - Document all changes
   - Include breaking changes

## 📞 Support and Maintenance

### Post-Launch Monitoring
- **Crash Reporting**: Implement crash reporting (Sentry, Bugsnag)
- **Analytics**: Track app usage (Firebase Analytics, Mixpanel)
- **User Feedback**: Monitor app store reviews
- **Performance**: Monitor app performance metrics

### Update Strategy
- **Emergency Fixes**: Immediate updates for critical issues
- **Feature Updates**: Regular feature releases
- **Security Updates**: Prompt security patch releases
- **Platform Updates**: Keep up with iOS/Android updates

## 🆘 Emergency App Specifics

### App Store Review Tips
- **Clear Emergency Purpose**: Explain emergency functionality clearly
- **Safety Features**: Highlight safety and emergency features
- **User Education**: Include user education about app limitations
- **Emergency Services**: Clarify relationship with emergency services

### User Safety
- **Emergency Instructions**: Clear instructions for emergency use
- **Limitation Disclaimers**: Clear disclaimers about app limitations
- **Emergency Services**: Always recommend calling emergency services first
- **User Training**: Provide user training materials

---

**⚠️ Important**: This is an emergency safety app. Ensure all emergency features are thoroughly tested and that users understand the app's limitations in emergency situations. 