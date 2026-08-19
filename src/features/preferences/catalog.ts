import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

import { COUNTRY_PRIMARY_CURRENCY } from '@/features/preferences/data/country-currency';

countries.registerLocale(en);

export type CountryOption = {
  code: string;
  name: string;
  flag: string;
};

export type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
};

const FALLBACK_COUNTRY_CODES = Object.keys(COUNTRY_PRIMARY_CURRENCY);

const FALLBACK_CURRENCY_CODES = [
  'AED',
  'AUD',
  'BDT',
  'BHD',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'EGP',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'JPY',
  'KES',
  'KRW',
  'KWD',
  'LKR',
  'MXN',
  'MYR',
  'NGN',
  'NOK',
  'NZD',
  'OMR',
  'PHP',
  'PKR',
  'PLN',
  'QAR',
  'RON',
  'RUB',
  'SAR',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'TWD',
  'UAH',
  'USD',
  'VND',
  'ZAR',
];

function supportedValues(type: 'region' | 'currency'): string[] {
  const intlWithSupported = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };
  try {
    const values = intlWithSupported.supportedValuesOf?.(type) ?? [];
    return values.filter((value) => /^[A-Z]{2,3}$/.test(value));
  } catch {
    return [];
  }
}

export function toFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return '';
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

export function getCountryName(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  return countries.getName(code, 'en') ?? code;
}

export function getCurrencyName(currencyCode: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'currency' }).of(currencyCode) ?? currencyCode;
  } catch {
    return currencyCode;
  }
}

export function getCurrencySymbol(currencyCode: string): string {
  try {
    const part = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    })
      .formatToParts(0)
      .find((item) => item.type === 'currency');
    return part?.value ?? currencyCode;
  } catch {
    return currencyCode;
  }
}

export function isValidCountryCode(countryCode: string): boolean {
  if (!/^[A-Z]{2}$/.test(countryCode)) return false;
  if (COUNTRY_PRIMARY_CURRENCY[countryCode] != null) return true;
  return getCountryName(countryCode) !== countryCode;
}

export function isValidCurrencyCode(currencyCode: string): boolean {
  if (!/^[A-Z]{3}$/.test(currencyCode)) return false;
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).format(1);
    return true;
  } catch {
    return false;
  }
}

export function getSuggestedCurrencyCode(countryCode: string): string | null {
  const suggested = COUNTRY_PRIMARY_CURRENCY[countryCode.toUpperCase()];
  if (suggested == null) return null;
  return isValidCurrencyCode(suggested) ? suggested : null;
}

export function getCountryOptions(): CountryOption[] {
  const codes = supportedValues('region').filter((code) => code.length === 2);
  const source = codes.length > 0 ? codes : FALLBACK_COUNTRY_CODES;
  return source
    .filter((code) => isValidCountryCode(code) || FALLBACK_COUNTRY_CODES.includes(code))
    .map((code) => ({
      code,
      name: getCountryName(code),
      flag: toFlagEmoji(code),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getCurrencyOptions(): CurrencyOption[] {
  const codes = supportedValues('currency');
  const source = codes.length > 0 ? codes : FALLBACK_CURRENCY_CODES;
  return source
    .filter((code) => isValidCurrencyCode(code))
    .map((code) => ({
      code,
      name: getCurrencyName(code),
      symbol: getCurrencySymbol(code),
    }))
    .sort((left, right) => left.code.localeCompare(right.code));
}

export function formatCountryLabel(countryCode: string): string {
  return `${toFlagEmoji(countryCode)}  ${getCountryName(countryCode)}`.trim();
}

export function formatCurrencyLabel(currencyCode: string): string {
  return `${getCurrencySymbol(currencyCode)}  ${currencyCode} — ${getCurrencyName(currencyCode)}`;
}
