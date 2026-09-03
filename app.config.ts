/// <reference types="node" />
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Google AdMob official sample App IDs (safe fallback when env is unset).
 * Prefer EXPO_PUBLIC_ADMOB_*_APP_ID for real builds.
 * @see https://developers.google.com/admob/android/test-ads
 */
const ADMOB_TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
// const ADMOB_TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

const ANDROID_GOOGLE_SERVICES = './google-services.json';
const IOS_GOOGLE_SERVICES = './GoogleService-Info.plist';

/**
 * Expo CLI loads `.env` / `.env.*` before evaluating this file, so
 * `process.env.EXPO_PUBLIC_*` is available here for the config plugin.
 * @see https://docs.expo.dev/guides/environment-variables/
 */
const admobAndroidAppId =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?.trim() || ADMOB_TEST_ANDROID_APP_ID;
// const admobIosAppId = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim() || ADMOB_TEST_IOS_APP_ID;

/** Local debug installs use `.dev` so they sit next to the Play Store app. Set APP_VARIANT=production for store builds. */
const isDevelopment = process.env.APP_VARIANT !== 'production';

const androidPackage = isDevelopment
  ? 'com.divyvasani.easyinvoicemaker.dev'
  : 'com.divyvasani.easyinvoicemaker';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isDevelopment ? 'Easy Invoice Maker (Dev)' : 'Easy Invoice Maker',
  slug: 'easy-invoice-maker',
  version: '0.1.6',
  orientation: 'portrait',
  icon: './assets/images/invoice-base-icon.png',
  scheme: 'easyinvoicemaker',
  userInterfaceStyle: 'automatic',
  ios: {
    buildNumber: '6',
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.divyvasani.easyinvoicemaker',
    supportsTablet: true,
    ...(existsSync(resolve(__dirname, IOS_GOOGLE_SERVICES))
      ? { googleServicesFile: IOS_GOOGLE_SERVICES }
      : {}),
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    versionCode: 6,
    package: androidPackage,
    adaptiveIcon: {
      backgroundColor: '#F0FFFB',
      foregroundImage: './assets/images/invoice-base-icon.png',
    },
    predictiveBackGestureEnabled: false,
    ...(existsSync(resolve(__dirname, ANDROID_GOOGLE_SERVICES))
      ? { googleServicesFile: ANDROID_GOOGLE_SERVICES }
      : {}),
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.WAKE_LOCK',
      'android.permission.VIBRATE',
      'com.google.android.gms.permission.AD_ID',
      'com.android.vending.BILLING',
    ],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-image',
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow $(PRODUCT_NAME) to access your photos so you can set a business logo and signature.',
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
    './plugins/with-android-cmake-version',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F0FFFB',
        image: './assets/images/splash-logo.png',
        imageWidth: 180,
      },
    ],
    [
      'expo-file-system',
      {
        enableFileSharing: true,
      },
    ],
    'expo-sharing',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon-small.png',
        color: '#FFFFFF',
      },
    ],
    './plugins/with-notification-large-icon',
    '@react-native-firebase/app',
    [
      '@react-native-firebase/analytics',
      {
        ios: {
          // Keep Ad ID support enabled for Analytics + AdMob attribution.
          withoutAdIdSupport: false,
        },
      },
    ],
    '@react-native-firebase/crashlytics',
    '@react-native-firebase/messaging',
    [
      'expo-build-properties',
      {
        android: {
          // Avoid AGP IncrementalSplitterRunnable failures on Windows when
          // packaging uncompressed page-aligned native libraries.
          useLegacyPackaging: true,
        },
        ios: {
          useFrameworks: 'static',
          forceStaticLinking: ['RNFBApp', 'RNFBAnalytics', 'RNFBCrashlytics', 'RNFBMessaging'],
        },
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: admobAndroidAppId,
        // iosAppId: admobIosAppId,
        userTrackingUsageDescription:
          'This identifier will be used to deliver personalized ads to you.',
        skAdNetworkItems: [
          'cstr6suwn9.skadnetwork',
          '4fzdc2evr5.skadnetwork',
          '2fnua5tdw4.skadnetwork',
          'ydx93a7ass.skadnetwork',
          'p78axxw29g.skadnetwork',
          'v72qych5uu.skadnetwork',
          'ludvb6z3bs.skadnetwork',
          'cp8zw746q7.skadnetwork',
          '3sh42y64q3.skadnetwork',
          'c6k4g5qg8m.skadnetwork',
          's39g8k73mm.skadnetwork',
          'wg4vff78zm.skadnetwork',
          '3qy4746246.skadnetwork',
          'f38h382jlk.skadnetwork',
          'hs6bdukanm.skadnetwork',
          'mlmmfzh3r3.skadnetwork',
          'v4nxqhlyqp.skadnetwork',
          'wzmmz9fp6w.skadnetwork',
          'su67r6k2v3.skadnetwork',
          'yclnxrl5pm.skadnetwork',
          't38b2kh725.skadnetwork',
          '7ug5zh24hu.skadnetwork',
          'gta9lk7p23.skadnetwork',
          'vutu7akeur.skadnetwork',
          'y5ghdn5j9k.skadnetwork',
          'v9wttpbfk9.skadnetwork',
          'n38lu8286q.skadnetwork',
          '47vhws6wlr.skadnetwork',
          'kbd757ywx3.skadnetwork',
          '9t245vhmpl.skadnetwork',
          'a2p9lx4jpn.skadnetwork',
          '22mmun2rn5.skadnetwork',
          '44jx6755aq.skadnetwork',
          'k674qkevps.skadnetwork',
          '4468km3ulz.skadnetwork',
          '2u9pt9hc89.skadnetwork',
          '8s468mfl3y.skadnetwork',
          'klf5c3l5u5.skadnetwork',
          'ppxm28t8ap.skadnetwork',
          'kbmxgpxpgc.skadnetwork',
          'uw77j35x4d.skadnetwork',
          '578prtvx9j.skadnetwork',
          '4dzt52r2t5.skadnetwork',
          'tl55sbb4fm.skadnetwork',
          'c3frkrj4fj.skadnetwork',
          'e5fvkxwrpn.skadnetwork',
          '8c4e2ghe7u.skadnetwork',
          '3rd42ekr43.skadnetwork',
          '97r2b46745.skadnetwork',
          '3qcr597p9d.skadnetwork',
        ],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...(process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim()
      ? {
          eas: {
            projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID.trim(),
          },
        }
      : {}),
  },
});
