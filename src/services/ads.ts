// Ads disabled for now — re-enable when AdMob is needed.
// import mobileAds from 'react-native-google-mobile-ads';

let initialized = false;

/**
 * Initializes the Google Mobile Ads SDK once.
 * Currently disabled — no AdMob usage.
 */
export async function initializeAds(): Promise<boolean> {
  // Ads temporarily disabled.
  //
  // if (initialized || Platform.OS === 'web') {
  //   return initialized;
  // }
  //
  // try {
  //   await mobileAds().initialize();
  //   initialized = true;
  //   return true;
  // } catch (error) {
  //   if (__DEV__) {
  //     console.warn('[ads] initialization skipped/failed:', error);
  //   }
  //   return false;
  // }

  return false;
}

export function isAdsInitialized(): boolean {
  return initialized;
}
