import { CountryCode, CurrencyCode, MetadataItem, MoneyObject } from './common';

export interface SendMoneyParams {
  /** Disbursement amount */
  amount: number;
  /** Recipient phone number in E.164 format (e.g. +256712345678) */
  phone_number: string;
  /** Unique merchant payout reference (max 50 chars) */
  reference: string;
  /** Target market country code */
  country: CountryCode;
  /** Currency code (For DRC: CDF default or USD) */
  currency?: CurrencyCode;
  /** Purpose or description of disbursement */
  description?: string;
  /** HTTPS webhook URL to receive payment status updates */
  callback_url?: string;
  /** Up to 10 metadata key-value items */
  metadata?: MetadataItem[];
}

export interface DisbursementTransactionInfo {
  uuid: string;
  reference: string;
  provider_reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | string;
}

export interface DisbursementDetails {
  amount: MoneyObject;
  charge?: MoneyObject;
  total_deduction?: MoneyObject;
  provider: string;
  phone_number: string;
  recipient_name?: string;
  metadata?: MetadataItem[];
}

export interface DisbursementAccountSnapshot {
  uuid: string;
  balance_before: MoneyObject;
  balance_after: MoneyObject;
}

export interface SendMoneyData {
  transaction: DisbursementTransactionInfo;
  /** Live create response uses withdrawal; callback or sandbox create may use disbursement */
  withdrawal?: DisbursementDetails;
  disbursement?: DisbursementDetails;
  account?: DisbursementAccountSnapshot;
  daily_limits?: Record<string, unknown>;
}

export interface SendMoneyServiceLimit {
  country: CountryCode;
  provider: string;
  min_amount: number;
  max_amount: number;
  currency: CurrencyCode;
}

export interface SendMoneyServicesData {
  services: SendMoneyServiceLimit[];
}
