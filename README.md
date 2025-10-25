# Happy Birthday App - Build & Deployment Guide

## 📋 Prerequisites

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   # or use: npm run eas:login
   ```

3. **Configure EAS for your project:**
   ```bash
   eas update:configure
   # or use: npm run eas:configure
   ```

4. **Update app.config.js with your project details:**
   - Replace `[your-project-id]` with your actual Expo project ID
   - Replace `[your-expo-username]` with your Expo username
   - Get these from running `eas update:configure`

---

## 🏗️ Build Types

### **Development Build** (APK)
- For testing during development
- Includes development tools and hot reload
- Larger file size
- Not optimized

**Build Commands:**
```bash
# Android only
eas build --profile development --platform android
# or use: npm run build:dev:android

# iOS only
eas build --profile development --platform ios
# or use: npm run build:dev:ios

# Both platforms
eas build --profile development --platform all
# or use: npm run build:dev:all
```

### **Preview Build** (APK)
- For internal testing and QA
- Production-like but not optimized for store
- Easier to distribute to testers
- APK format for easy installation

**Build Commands:**
```bash
# Android only
eas build --profile preview --platform android
# or use: npm run build:preview:android

# iOS only
eas build --profile preview --platform ios
# or use: npm run build:preview:ios

# Both platforms
eas build --profile preview --platform all
# or use: npm run build:preview:all
```

### **Production Build** (AAB)
- For Google Play Store submission
- Fully optimized and minified
- AAB format (Android App Bundle)
- Smallest download size for users

**Build Commands:**
```bash
# Android only
eas build --profile production --platform android
# or use: npm run build:prod:android

# iOS only
eas build --profile production --platform ios
# or use: npm run build:prod:ios

# Both platforms
eas build --profile production --platform all
# or use: npm run build:prod:all
```

---

## 🔄 OTA Updates (Over-The-Air)

OTA updates allow you to push JavaScript changes without rebuilding the app.

### **Development Update:**
```bash
eas update --channel development --message "Your update description" --non-interactive
# or use: npm run update:dev
```

### **Preview Update:**
```bash
eas update --channel preview --message "Your update description" --non-interactive
# or use: npm run update:preview
```

### **Production Update:**
```bash
eas update --channel production --message "Your update description" --non-interactive
# or use: npm run update:prod
```

**Note:** OTA updates can only update JavaScript and assets. Native code changes require a new build.

---

## 📦 Submit to Stores

### **Google Play Store (Android):**
```bash
eas submit --platform android --profile production
# or use: npm run submit:android
```

**Before submitting:**
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Save it as `google-service-account.json` in project root
4. Update `eas.json` with the correct path

### **Apple App Store (iOS):**
```bash
eas submit --platform ios --profile production
# or use: npm run submit:ios
```

**Before submitting:**
1. Update `eas.json` with your Apple credentials:
   - `appleId`: Your Apple ID email
   - `ascAppId`: App Store Connect App ID
   - `appleTeamId`: Your Apple Team ID

---

## 🔑 Environment Variables

Each build profile has different environment variables set in `app.config.js`:

- **Development:** `APP_VARIANT=development`
  - App name: "HBD (Dev)"
  - Bundle ID: `com.happybirthday.dev`

- **Preview:** `APP_VARIANT=preview`
  - App name: "HBD (Preview)"
  - Bundle ID: `com.happybirthday.preview`

- **Production:** `APP_VARIANT=production`
  - App name: "Happy Birthday"
  - Bundle ID: `com.happybirthday`

---

## 📱 Installing Builds

### **Development & Preview (APK):**
1. Download the APK from EAS build page
2. Transfer to Android device
3. Enable "Install from Unknown Sources"
4. Install the APK

### **Production (AAB):**
- AAB files can only be uploaded to Google Play Console
- Users download from Play Store

---

## 🐛 Troubleshooting

### **Build fails:**
```bash
# Clear cache and rebuild
eas build --profile [profile-name] --platform [platform] --clear-cache
```

### **Update not appearing:**
```bash
# Check update status
eas update:list --channel [channel-name]

# Force check for updates in app
# Restart the app completely
```

### **Check build status:**
```bash
eas build:list
```

### **View build logs:**
```bash
eas build:view [build-id]
```

---

## 📊 Build Workflow

### Typical Development Flow:

1. **Development:**
   ```bash
   npm run build:dev:android
   # Install on device for testing
   ```

2. **Make changes and test with OTA:**
   ```bash
   npm run update:dev
   # App will update on next launch
   ```

3. **Ready for testing:**
   ```bash
   npm run build:preview:android
   # Share with testers
   ```

4. **Final release:**
   ```bash
   # Increment version in app.config.js
   npm run build:prod:android
   npm run submit:android
   ```

---

## 🔄 Version Management

### **Updating version numbers:**

Edit `app.config.js`:

```javascript
version: "1.0.1",  // User-facing version
```

For Android:
```javascript
android: {
  versionCode: 2,  // Increment for each release
}
```

For iOS:
```javascript
ios: {
  buildNumber: "2",  // Increment for each release
}
```

Or use auto-increment in production builds (already configured in `eas.json`).

---

## 📝 Quick Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run build:dev:android` | Dev build for testing | APK |
| `npm run build:preview:android` | Preview build for QA | APK |
| `npm run build:prod:android` | Production build for store | AAB |
| `npm run update:dev` | Push OTA update to dev | - |
| `npm run update:preview` | Push OTA update to preview | - |
| `npm run update:prod` | Push OTA update to production | - |
| `npm run submit:android` | Submit to Play Store | - |

---

## 🎯 Best Practices

1. **Always test with preview builds** before production
2. **Use OTA updates** for minor changes (no native code)
3. **Increment version codes** for each new build
4. **Test on physical devices** for notifications
5. **Keep separate builds** for dev, preview, and production
6. **Document changes** in update messages

---

## 📞 Support

- **EAS Documentation:** https://docs.expo.dev/eas/
- **Build Issues:** https://docs.expo.dev/build/introduction/
- **OTA Updates:** https://docs.expo.dev/eas-update/introduction/

---

## ✅ Checklist Before Production Release

- [ ] Update version number in `app.config.js`
- [ ] Test on physical Android device
- [ ] Test all notification features
- [ ] Test offline functionality
- [ ] Review and update Play Store listing
- [ ] Prepare screenshots and description
- [ ] Build production AAB: `npm run build:prod:android`
- [ ] Test the production build before submitting
- [ ] Submit to Play Store: `npm run submit:android`
- [ ] Monitor crash reports and reviews