import type { OfflineEntity } from '@/types/models/common';

export enum AdvertisementProvider {
  AdMob = 'admob',
}

export enum AdvertisementFormat {
  Banner = 'banner',
  Interstitial = 'interstitial',
  Rewarded = 'rewarded',
}

export enum AdvertisementPlacement {
  Dashboard = 'dashboard',
  InvoiceList = 'invoice_list',
  CustomerList = 'customer_list',
}

export interface Advertisement extends OfflineEntity {
  provider: AdvertisementProvider;
  format: AdvertisementFormat;
  placement: AdvertisementPlacement;
  adUnitId: string;
  isEnabled: boolean;
}
