import { CountryCode, CurrencyCode, MetadataItem, MoneyObject } from './common';

export type CollectionMethod = 'mobile_money' | 'card';

export interface CreateCollectionParams {
  /** Collection amount */
  amount: number;
  /** Phone number in E.164 format (e.g. +256712345678). Required for mobile_money. */
  phone_number?: string;
  /** Unique UUID reference per collection request */
  reference: string;
  /** Market country code */
  country: CountryCode;
  /** Currency code (For DRC: CDF or USD) */
  currency?: CurrencyCode;
  /** Payment method: 'mobile_money' (default) or 'card' */
  method?: CollectionMethod;
  /** Optional transaction description (max 255 chars) */
  description?: string;
  /** HTTPS webhook URL to receive payment status update */
  callback_url?: string;
  /** Up to 10 metadata key-value items */
  metadata?: MetadataItem[];
}

export interface CollectionTransactionInfo {
  uuid: string;
  reference: string;
  status: 'processing' | 'pending' | 'completed' | 'failed' | 'cancelled' | string;
  provider_reference?: string | null;
}

export interface CollectionDetails {
  amount: MoneyObject;
  provider: string;
  phone_number?: string;
  mode?: string;
  metadata?: MetadataItem[];
}

export interface CollectionTimeline {
  initiated_at: string;
  estimated_settlement?: string;
}

export interface CreateMobileCollectionData {
  transaction: CollectionTransactionInfo;
  collection: CollectionDetails;
  timeline?: CollectionTimeline;
  metadata?: {
    response_timestamp: string;
    sandbox_mode: boolean;
  };
}

export interface CreateCardCollectionData {
  transaction: CollectionTransactionInfo;
  redirect_url: string;
}

export type CreateCollectionData = CreateMobileCollectionData | CreateCardCollectionData;

export interface ServiceProviderInfo {
  code: string;
  name: string;
  country: CountryCode;
  methods: CollectionMethod[];
}

export interface CollectionServicesData {
  services: ServiceProviderInfo[];
}

export interface GetCollectionStatusData {
  transaction: CollectionTransactionInfo;
  collection?: CollectionDetails;
}
