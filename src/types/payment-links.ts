import { CountryCode, CurrencyCode, MoneyObject } from './common';

export interface CreatePaymentLinkParams {
  title: string;
  type?: 'payment' | 'donation' | 'subscription' | string;
  amount: number;
  is_fixed?: boolean;
  currency: CurrencyCode;
  country: CountryCode;
  description?: string;
  redirect_url?: string;
  callback_url?: string;
  collection_methods?: string[];
}

export interface PaymentLinkRecord {
  uuid: string;
  title: string;
  type: string;
  amount: MoneyObject;
  is_fixed: boolean;
  currency: CurrencyCode;
  country: CountryCode;
  description?: string;
  payment_url: string;
  redirect_url?: string;
  callback_url?: string;
  status: 'active' | 'inactive' | 'archived' | string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentLinkData {
  payment_link: PaymentLinkRecord;
}

export interface ListPaymentLinksParams {
  country?: CountryCode;
  currency?: CurrencyCode;
  page?: number;
  per_page?: number;
}
