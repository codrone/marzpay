import { CountryCode, CurrencyCode, MetadataItem, MoneyObject, PaginationMeta } from './common';

export interface GetTransactionsParams {
  page?: number;
  per_page?: number;
  status?: 'processing' | 'pending' | 'completed' | 'failed' | 'cancelled' | string;
  country?: CountryCode;
  currency?: CurrencyCode;
  start_date?: string;
  end_date?: string;
}

export interface TransactionSummaryRecord {
  uuid: string;
  reference: string;
  provider_reference?: string | null;
  type: 'collection' | 'disbursement' | 'bill_payment' | 'airtime_data' | string;
  status: 'processing' | 'pending' | 'completed' | 'failed' | 'cancelled' | string;
  amount: MoneyObject;
  charge?: MoneyObject;
  net_amount?: MoneyObject;
  provider?: string;
  phone_number?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  metadata?: MetadataItem[];
}

export interface TransactionListData {
  transactions: TransactionSummaryRecord[];
  pagination: PaginationMeta;
}
