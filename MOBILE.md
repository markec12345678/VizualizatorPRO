# 📱 Mobilna aplikacija (Capacitor)

VizualizatorPRO je pripravljen za mobilne platforme (Android in iOS) preko [Capacitor](https://capacitorjs.com/).

## 🚀 Hitri začetek

### 1. Namestitev odvisnosti

```bash
# Core + CLI
npm install @capacitor/core @capacitor/cli

# Native platforme
npm install @capacitor/android @capacitor/ios

# Native plugins (po želji)
npm install @capacitor/camera @capacitor/geolocation
npm install @capacitor/local-notifications @capacitor/push-notifications
npm install @capacitor/status-bar @capacitor/splash-screen
npm install @capacitor/app
```

### 2. Inicializacija

```bash
# Inicializiraj Capacitor (konfiguracija je že v capacitor.config.ts)
npx cap init

# Dodaj platforme
npx cap add android
npx cap add ios
```

### 3. Build in sync

```bash
# Build web aplikacije
bun run build

# Sinhroniziraj web v native projekte
npx cap sync

# Kopiraj slike in statične datoteke
npx cap copy
```

### 4. Odpiranje v IDE

```bash
# Android Studio
npx cap open android

# Xcode (potrebujete macOS)
npx cap open ios
```

### 5. Build APK/IPA

#### Android (v Android Studio)
1. Odpri projekt v Android Studiu
2. Build → Build Bundle(s)/APK(s) → Build APK(s)
3. APK bo v `android/app/build/outputs/apk/debug/app-debug.apk`

#### iOS (v Xcode)
1. Odpri projekt v Xcode
2. Izberi svoj developer account
3. Product → Build (ali Archive za App Store)
4. IPA bo v `ios/App/`

---

## 🔧 Konfiguracija

### capacitor.config.ts

Konfiguracija je v `capacitor.config.ts` v korenu projekta:

```typescript
{
  appId: 'si.vizualizatorpro.app',
  appName: 'VizualizatorPRO',
  webDir: '.next/standalone',
  // ...
}
```

### Next.js standalone output

`next.config.ts` mora imeti omogočen standalone output za Capacitor:

```typescript
const nextConfig = {
  output: 'standalone',
  // ...
}
```

To je že konfigurirano v projektu.

---

## 📋 Native funkcionalnosti

### Kamera (AR vizualizacije)

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const photo = await Camera.getPhoto({
  resultType: CameraResultType.Base64,
  source: CameraSource.Camera,
  quality: 85,
})
```

### Geolocation (lokacije projektov)

```typescript
import { Geolocation } from '@capacitor/geolocation'

const pos = await Geolocation.getCurrentPosition()
console.log(pos.coords.latitude, pos.coords.longitude)
```

### Lokalna obvestila

```typescript
import { LocalNotifications } from '@capacitor/local-notifications'

await LocalNotifications.schedule({
  notifications: [{
    title: 'Nov lead',
    body: 'Prejel si novo povpraševanje',
    id: 1,
    schedule: { at: new Date(Date.now() + 1000 * 60) },
  }],
})
```

### Push obvestila (Firebase Cloud Messaging)

```typescript
import { PushNotifications } from '@capacitor/push-notifications'

await PushNotifications.requestPermissions()
await PushNotifications.register()

PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Push received:', notification)
})
```

### Status bar

```typescript
import { StatusBar, Style } from '@capacitor/status-bar'

await StatusBar.setStyle({ style: Style.Light }) // bele ikone
await StatusBar.setBackgroundColor({ color: '#0a0a0a' })
```

---

## 🎨 App ikone in splash screen

### Generiranje ikon

```bash
# Namesti @capacitor/assets
npm install --save-dev @capacitor/assets

# Pripravi slike v resources/ mapi:
# resources/icon.png (1024x1024)
# resources/splash.png (2732x2732)

# Generiraj vse velikosti
npx capacitor-assets generate --android
npx capacitor-assets generate --ios
```

### Ročno

- Android: `android/app/src/main/res/`
- iOS: `ios/App/App/Assets.xcassets/`

---

## 📦 Distribucija

### Google Play Store

1. Ustvari keystore:
```bash
keytool -genkey -v -keystore vizualizatorpro.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias vizualizatorpro
```

2. Build signed APK v Android Studio
3. Ustvari app na [Google Play Console](https://play.google.com/console)
4. Prenesi APK/AAB

### Apple App Store

1. Potrebujete Apple Developer account ($99/leto)
2. Ustvarite App ID v [Apple Developer Portal](https://developer.apple.com)
3. Build v Xcode → Archive → Distribute App
4. Ustvari app na [App Store Connect](https://appstoreconnect.apple.com)

---

## 🔄 Avtomatski update (Live Updates)

Za hitro posodabljanje brez App Store review:

```bash
npm install @capacitor/app
```

Možnosti:
- [Capacitor Updater](https://github.com/Cap-go/capacitor-updater) (Capgo)
- [Ionic Appflow](https://ionic.io/appflow) (plačljivo)
- Microsoft CodePush (zastarelo)

---

## 🧪 Testiranje

### Na napravi

```bash
# Android (poveži telefon z USB debugging)
npx cap run android

# iOS (poveži iPhone)
npx cap run ios
```

### V simulatorju

```bash
# Android emulator
npx cap run android --target=Pixel_5_API_31

# iOS simulator
npx cap run ios --target="iPhone 13"
```

---

## ⚠️ Pomembne opombe

1. **iOS zahteva macOS** za build (Xcode je samo za macOS)
2. **HTTPS** je obvezen za Camera API na mobilnih napravah
3. **Permisije** morajo biti jasno opisane v app store opisih
4. **App Store Review** traja 1-7 dni (iOS), Google Play 1-3 dni
5. **App size** - optimiziraj slike in odstrani unused dependencies pred build-om

---

## 📞 Podpora

- [Capacitor dokumentacija](https://capacitorjs.com/docs)
- [Capacitor community](https://github.com/capacitor-community)
- [Ionic forum](https://forum.ionicframework.com)

---

**VizualizatorPRO** je pripravljen za App Store in Google Play! 🚀
