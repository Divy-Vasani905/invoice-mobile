// Ads disabled for now — re-enable when AdMob is needed.
// import { Platform } from 'react-native';
// import { TestIds } from 'react-native-google-mobile-ads';
//
// import { env } from '@/constants/env';
//
// /**
//  * Ad unit ID placeholders.
//  * Uses Google sample unit IDs in __DEV__ (or when env unit IDs are empty).
//  * No ad placement / loading logic lives here.
//  */
// const useTestUnits = __DEV__ || Platform.OS === 'web';
//
// export const adUnitIds = {
//   banner:
//     !useTestUnits && env.admob.bannerUnitId
//       ? env.admob.bannerUnitId
//       : TestIds.BANNER,
//   interstitial:
//     !useTestUnits && env.admob.interstitialUnitId
//       ? env.admob.interstitialUnitId
//       : TestIds.INTERSTITIAL,
//   rewarded:
//     !useTestUnits && env.admob.rewardedUnitId
//       ? env.admob.rewardedUnitId
//       : TestIds.REWARDED,
// } as const;
//
// export type AdUnitIds = typeof adUnitIds;

/** Placeholder until AdMob is re-enabled. */
export const adUnitIds = {
  banner: '',
  interstitial: '',
  rewarded: '',
} as const;

export type AdUnitIds = typeof adUnitIds;
