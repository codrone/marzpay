import { MoneyObject } from './common';

export type UtilityCode = 'LIGHT' | 'NWSC' | 'DSTV' | 'GOTV' | string;

export interface VerifyBillParams {
  /** Utility identifier: LIGHT, NWSC, DSTV, GOTV */
  utility_code: UtilityCode;
  /** Meter number or Smartcard account number */
  meter_number: string;
  /** Required for NWSC (e.g. "Kampala") */
  area?: string;
}

export interface BillCustomerDetails {
  customer_ref?: string;
  smart_card_no?: string;
  customer_name: string;
  outstanding_balance?: number;
  area?: string;
  customer_type?: string;
  last_payment_date?: string;
  last_payment_amount?: string;
  bouquet_code?: string;
  bouquet_name?: string;
  bouquet_price?: string;
  utility_code?: UtilityCode;
}

export interface VerifyBillData {
  customer_details: BillCustomerDetails;
  utility_code: UtilityCode;
  meter_number: string;
}

export interface PayBillParams {
  /** Unique reference (UUID) */
  reference: string;
  /** Utility code: LIGHT, NWSC, DSTV, GOTV */
  utility_code: UtilityCode;
  /** Meter or SmartCard number */
  meter_number: string;
  /** Phone number for notifications */
  phone_number: string;
  /** Amount to pay (For DSTV/GOTV, must match exact bouquet price) */
  amount: number;
  /** Customer name */
  customer_name?: string;
  /** Customer email for receipt */
  email?: string;
  /** Webhook callback URL */
  callback_url?: string;
  /** Area string (Required for NWSC, e.g. "Kampala") */
  area?: string;
  /** Bouquet code (Required for DSTV / GOTV) */
  bouquet_code?: string;
}

export interface BillPaymentDetails {
  utility_code: UtilityCode;
  meter_number: string;
  customer_name?: string;
  amount: MoneyObject;
  charge?: MoneyObject;
  total_amount?: MoneyObject;
}

export interface PayBillData {
  transaction: {
    uuid: string;
    reference: string;
    status: 'completed' | 'pending' | 'failed' | string;
    provider_reference?: string;
  };
  bill_payment: BillPaymentDetails;
  timeline?: {
    initiated_at: string;
    completed_at?: string;
  };
}

export interface TVBouquet {
  code: string;
  name: string;
  price: number;
  description?: string;
}
