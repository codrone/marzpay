import { MoneyObject, WalletSource } from './common';

export interface ValidateBankAccountParams {
  bank_name: string;
  account_number: string;
}

export interface ValidateBankAccountData {
  account_name: string;
  account_number: string;
  bank_name: string;
  is_valid: boolean;
}

export interface CreateBankTransferParams {
  /** Transfer amount */
  amount: number;
  /** Bank name (e.g. "Equity Bank", "Stanbic Bank") */
  bank_name: string;
  /** Destination bank account number */
  bank_account_number: string;
  /** Account holder full name */
  bank_account_name: string;
  /** Bank branch name */
  bank_branch?: string;
  /** Description or narrative */
  description?: string;
  /** Wallet source: 'main' (default) or 'card' */
  wallet_source?: WalletSource;
}

export interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch?: string;
}

export interface BankTransferRecord {
  id?: number;
  reference: string;
  transaction_uuid?: string;
  amount: MoneyObject;
  charge_amount?: MoneyObject;
  total_amount?: MoneyObject;
  description?: string;
  status: 'processing' | 'completed' | 'failed' | string;
  wallet_source?: WalletSource;
  bank_details: BankDetails;
  balance?: {
    current: string;
    after_transaction: string;
  };
  provider?: {
    transaction_id?: string;
    status_code?: string;
    status_description?: string;
  };
  created_at?: string;
}

export interface BankTransferData {
  bank_transfer?: BankTransferRecord;
  bank_transfer_request?: BankTransferRecord;
}

export interface SupportedBank {
  code: string;
  name: string;
  country: string;
}

export interface SupportedBanksData {
  banks: SupportedBank[];
}
