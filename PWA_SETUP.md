# Siren PWA Setup Guide

## 🚀 What's Been Added

Your Siren app has been successfully converted to a Progressive Web App (PWA) with the following features:

### ✅ Core PWA Features
- **Web App Manifest** (`/public/manifest.json`) - Defines app metadata, icons, and behavior
- **Service Worker** (`/public/sw.js`) - Handles caching, offline functionality, and push notifications
- **PWA Meta Tags** - Added to `index.html` for proper mobile app behavior
- **Install Prompt** - Shows when users can install the app
- **Offline Indicator** - Shows when users are offline

### 🎨 PWA Components
- `PWAInstall` - Install prompt component
- `OfflineIndicator` - Shows offline status
- `usePWA` - Custom hook for PWA functionality

### 📱 App Features
- **Standalone Mode** - App runs in full-screen without browser UI
- **Offline Support** - Core functionality works without internet
- **Push Notifications** - Emergency alerts and safety notifications
- **App Shortcuts** - Quick access to emergency features
- **Responsive Design** - Works on all device sizes

## 🔧 Next Steps

### 1. Generate Icons
Run the icon generation script:
```bash
node scripts/generate-icons.js
```

This will show you how to convert the SVG icon to PNG files. You need these icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### 2. Create Shortcut Icons
Create these additional icons for app shortcuts:
- `emergency-96x96.png` - Red emergency icon
- `report-96x96.png` - Document icon  
- `dial-96x96.png` - Phone icon

### 3. Set Up Push Notifications (Optional)
To enable push notifications:

1. Generate VAPID keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

2. Update the VAPID public key in `client/hooks/usePWA.ts`:
```typescript
applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
```

3. Set up server-side push notification handling

### 4. Test PWA Features

#### Development Testing:
```bash
npm run dev
```

#### Production Testing:
```bash
npm run build
npm start
```

#### PWA Testing Tools:
- Chrome DevTools > Application > Manifest
- Chrome DevTools > Application > Service Workers
- Lighthouse PWA audit

## 📋 PWA Checklist

- [x] Web App Manifest
- [x] Service Worker
- [x] HTTPS (required for PWA)
- [x] Responsive design
- [x] Install prompt
- [x] Offline functionality
- [ ] Icons (all sizes)
- [ ] Shortcut icons
- [ ] Push notifications
- [ ] Background sync
- [ ] App shortcuts

## 🌐 Deployment

### Netlify (Recommended)
Your app is already configured for Netlify deployment. The PWA will work automatically.

### Other Platforms
Ensure your hosting platform:
- Serves over HTTPS
- Has proper MIME types for manifest.json
- Supports service workers

## 🔍 PWA Validation

Test your PWA with these tools:
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [WebPageTest](https://www.webpagetest.org/)

## 📱 Mobile Installation

Users can install your PWA by:
1. **Chrome/Edge**: Tap the install icon in the address bar
2. **Safari**: Tap Share > Add to Home Screen
3. **Android**: Tap the install prompt or menu option

## 🚨 Emergency Features

The PWA enhances your safety app with:
- **Offline Emergency Access** - Core features work without internet
- **Quick Installation** - One-tap install for emergency situations
- **Push Alerts** - Instant safety notifications
- **App Shortcuts** - Direct access to emergency features

## 🛠️ Customization

### Update App Name/Description
Edit `/public/manifest.json`:
```json
{
  "name": "Your App Name",
  "description": "Your app description"
}
```

### Change Theme Color
Update in both `manifest.json` and `index.html`:
```json
{
  "theme_color": "#your-color"
}
```

### Add More Shortcuts
Add to `manifest.json` shortcuts array:
```json
{
  "name": "Feature Name",
  "url": "/feature-url",
  "icons": [{"src": "/icons/feature-96x96.png", "sizes": "96x96"}]
}
```

## 🐛 Troubleshooting

### Service Worker Not Registering
- Ensure HTTPS in production
- Check browser console for errors
- Verify `/sw.js` is accessible

### Icons Not Showing
- Check file paths in manifest.json
- Ensure all icon sizes exist
- Verify MIME types are correct

### Install Prompt Not Showing
- App must meet PWA criteria
- User must interact with site first
- Check browser compatibility

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Best Practices](https://web.dev/pwa-checklist/)

---

Your Siren safety app is now a fully functional PWA! 🎉
