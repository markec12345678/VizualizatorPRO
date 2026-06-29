import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor konfiguracija za VizualizatorPRO
 * 
 * Uporaba:
 * 1. npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
 * 2. npx cap init
 * 3. npx cap add android
 * 4. npx cap add ios
 * 5. npx cap sync
 * 6. npx cap open android (ali ios)
 * 
 * Build:
 * - Web: bun run build
 * - Sync: npx cap sync
 * - Android: npx cap open android → Build APK v Android Studiu
 * - iOS: npx cap open ios → Build v Xcode (potrebujete macOS)
 */

const config: CapacitorConfig = {
  appId: 'si.vizualizatorpro.app',
  appName: 'VizualizatorPRO',
  webDir: '.next/standalone',
  bundledWebRuntime: false,
  backgroundColor: '#0a0a0a',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Za development - poveži z lokalnim dev serverjem
    // url: 'http://192.168.1.100:3000',
    // cleartext: true,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a0a0a',
    // Limiti za varno območje (notch)
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Camera: {
      // Permission besedila
      permissions: [
        {
          title: 'Dostop do kamere',
          message: 'VizualizatorPRO potrebuje kamero za AR vizualizacije in zajem slik balkonov.',
        },
      ],
    },
    Geolocation: {
      permissions: [
        {
          title: 'Dostop do lokacije',
          message: 'Lokacija se uporablja za označevanje projektov na terenu.',
        },
      ],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#f59e0b',
      sound: 'notification.wav',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'LIGHT', // bele ikone na antracit ozadju
      backgroundColor: '#0a0a0a',
      overlaysWebView: false,
    },
    App: {
      // Restart app na cold start
      killProcessesOnAppClose: false,
    },
  },
  // Native plugins (preko npm)
  cordova: {},
}

export default config
