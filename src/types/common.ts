/**
  Country code ISO 3166-1 alpha-2 supported by MarzPay
 */
export type CountryCode =
  | 'UG' // Uganda
  | 'KE' // Kenya
  | 'RW' // Rwanda
  | 'CD' // DRC (Democratic Republic of the Congo)
  | 'ZM' // Zambia
  | 'CM' // Cameroon
  | 'BJ' // Benin
  | 'CI' // Côte d'Ivoire
  | 'GA' // Gabon
  | 'CG' // Congo-Brazzaville
  | 'SN' // Senegal
  | 'SL'; // Sierra Leone

/**
  Supported currency ISO codes
 */
export type CurrencyCode =
  | 'UGX'
  | 'KES'
  | 'RWF'
  | 'ZMW'
  | 'XAF'
  | 'XOF'
  | 'SLE'
  | 'CDF'
  | 'USD';

/**
  Wallet source identifier
 */
export type WalletSource = 'main' | 'card';

/**
  Standard money representation in MarzPay responses
 */
export interface MoneyObject {
  /** Formatted string with commas and decimals, e.g. "5,000.00" */
  formatted: string;
  /** Raw numerical amount for calculations, e.g. 5000 */
  raw: number;
  /** Currency code */
  currency: CurrencyCode;
}

/**
  Metadata item sent with collection, disbursement, or bank transfer requests
 */
export interface MetadataItem {
  [key: string]: string | number | boolean | undefined;
  isPII?: boolean;
}

/**
  Standard MarzPay API wrapper response
 */
export interface APIResponseEnvelope<T = Record<string, unknown>> {
  status: 'success' | 'error' | 'sandbox';
  message?: string;
  data: T;
  error_code?: string;
  errors?: Record<string, string[]>;
}

/**
  Pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}
