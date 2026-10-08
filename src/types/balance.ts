import { CountryCode, CurrencyCode, MoneyObject, PaginationMeta } from './common';

export interface GetBalanceParams {
  /** Country market code (e.g. 'UG', 'KE', 'CD') */
  country?: CountryCode;
  /** Currency code (For DRC: 'CDF' or 'USD') */
  currency?: CurrencyCode;
}

export interface WalletLimits {
  withdrawal: { minimum: number; maximum: number };
  deposit: { minimum: number; maximum: number };
}

export interface AccountBalanceInfo {
  uuid: string;
  business_name?: string;
  balance: MoneyObject;
  available_balance: MoneyObject;
  total_balance: MoneyObject;
  card_balance: MoneyObject & { description?: string };
  status?: {
    mode: 'live' | 'sandbox' | string;
    account_status: string;
    is_frozen: boolean;
    freeze_reason?: string | null;
  };
  limits?: WalletLimits;
}

export interface SingleCurrencyWallet {
  currency: CurrencyCode;
  available_balance: MoneyObject;
  card_balance: MoneyObject;
  total_balance: MoneyObject;
  reservoir?: MoneyObject;
  withdrawable_balance: MoneyObject;
}

export interface AccountBalanceData {
  account: AccountBalanceInfo;
  wallets: SingleCurrencyWallet[];
  summary?: {
    monthly?: Record<string, unknown>;
    weekly?: Record<string, unknown>;
    daily?: Record<string, unknown>;
  };
  metadata: {
    country_code: CountryCode;
    currency: CurrencyCode;
    last_updated?: string;
    response_timestamp?: string;
    sandbox_mode?: boolean;
  };
}

export interface GetBalanceHistoryParams extends GetBalanceParams {
  page?: number;
  per_page?: number;
  operation?: 'collection' | 'disbursement' | 'bill_payment' | 'airtime_data' | 'refund' | string;
  type?: 'credit' | 'debit';
  start_date?: string;
  end_date?: string;
}

export interface BalanceHistoryRecord {
  uuid: string;
  amount: MoneyObject;
  operation: string;
  type: 'credit' | 'debit';
  description: string;
  balance_before: number;
  balance_after: number;
  timestamp: string;
}

export interface BalanceHistoryData {
  account: {
    uuid: string;
    current_balance: MoneyObject;
  };
  history: BalanceHistoryRecord[];
  pagination: PaginationMeta;
  filters?: Record<string, unknown>;
  metadata: {
    country_code: CountryCode;
    currency: CurrencyCode;
    response_timestamp?: string;
  };
}
