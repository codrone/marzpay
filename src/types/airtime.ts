import { MoneyObject } from './common';

export type AirtimePurchaseType = 'airtime' | 'bundle';

export interface BuyAirtimeParams {
  /** Unique reference (UUID) */
  reference: string;
  /** Purchase type identifier: 'airtime' */
  purchase_type: 'airtime';
  /** Recipient MSISDN (e.g. "256771234567") */
  msisdn: string;
  /** Airtime amount */
  amount: number;
}

export interface BuyDataBundleParams {
  /** Unique reference (UUID) */
  reference: string;
  /** Purchase type identifier: 'bundle' */
  purchase_type: 'bundle';
  /** Recipient MSISDN (e.g. "256771234567") */
  msisdn: string;
  /** Bundle ID from catalog (e.g. "RACT_UG_Data_201") */
  bundle_id: string;
}

export type AirtimePurchaseParams = BuyAirtimeParams | BuyDataBundleParams;

export interface AirtimePurchaseDetails {
  network: 'MTN' | 'Airtel' | 'Lyca' | string;
  gateway?: string;
  purchase_type: AirtimePurchaseType;
  msisdn: string;
  product_id?: string | null;
  product_name?: string;
  provider_transaction_id?: string;
  result?: string;
  error_message?: string | null;
}

export interface AirtimePurchaseData {
  uuid: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed' | string;
  provider_reference?: string;
  amount: MoneyObject;
  charge?: MoneyObject;
  airtime_data: AirtimePurchaseDetails;
  created_at?: string;
  updated_at?: string;
}

export interface DataBundleItem {
  id: string;
  name: string;
  price: number;
  validity?: string;
  network: string;
}

export interface AirtimeCatalogData {
  network: string;
  bundles: DataBundleItem[];
}
