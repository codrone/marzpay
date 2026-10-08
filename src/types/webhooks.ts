import { MetadataItem, MoneyObject } from './common';

export interface CreateWebhookConfigParams {
  name: string;
  url: string;
  event_type: string;
  environment?: 'production' | 'sandbox' | string;
  is_active?: boolean;
}

export type UpdateWebhookConfigParams = Partial<CreateWebhookConfigParams>;

export interface WebhookConfigRecord {
  id: number;
  uuid: string;
  name: string;
  url: string;
  event_type: string;
  environment: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/* ========================================================================== */
/* Direct Callback Event Payloads                                             */
/* ========================================================================== */

export interface CollectionCompletedEvent {
  event_type: 'collection.completed' | 'success';
  transaction: {
    uuid: string;
    reference: string;
    status: 'completed';
    amount: MoneyObject;
    charge?: MoneyObject;
    net_amount?: MoneyObject;
    provider: string;
    phone_number: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
  collection: {
    provider: string;
    phone_number: string;
    amount: MoneyObject;
    charge?: MoneyObject;
    net_amount?: MoneyObject;
    mode?: string;
    provider_transaction_id: string;
  };
  metadata?: MetadataItem[];
}

export interface CollectionFailedEvent {
  event_type: 'collection.failed' | 'collection.cancelled' | 'failure';
  transaction: {
    uuid: string;
    reference: string;
    status: 'failed' | 'cancelled';
    amount?: MoneyObject;
    provider?: string;
    phone_number?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
  collection?: {
    provider?: string;
    phone_number?: string;
    provider_transaction_id?: string;
  };
  metadata?: MetadataItem[];
}

export interface DisbursementCompletedEvent {
  event_type: 'disbursement.completed';
  transaction: {
    uuid: string;
    reference: string;
    /** The merchant's submitted reference */
    provider_reference: string;
    status: 'completed';
    amount: MoneyObject;
    provider: string;
    phone_number: string;
    recipient_name?: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
  disbursement: {
    provider: string;
    phone_number: string;
    amount: MoneyObject;
    mode?: string;
    recipient_name?: string;
    provider_transaction_id: string;
  };
  metadata?: MetadataItem[];
}

export interface DisbursementFailedEvent {
  event_type: 'disbursement.failed' | 'disbursement.cancelled';
  transaction: {
    uuid: string;
    reference: string;
    provider_reference: string;
    status: 'failed' | 'cancelled';
    amount?: MoneyObject;
    provider?: string;
    phone_number?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
  disbursement?: {
    provider?: string;
    phone_number?: string;
    provider_transaction_id?: string;
  };
  metadata?: MetadataItem[];
}

export interface BillPaymentCompletedEvent {
  event_type: 'bill_payment.completed';
  transaction: {
    uuid: string;
    reference: string;
    status: 'completed';
    amount: MoneyObject;
    phone_number?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
  bill_payment: {
    provider: string;
    utility_code: string;
    meter_number: string;
    area?: string | null;
    bouquet_code?: string | null;
    phone_number?: string;
    amount: MoneyObject;
    provider_reference: string;
  };
  metadata?: MetadataItem[];
}

export interface BillPaymentFailedEvent {
  event_type: 'bill_payment.failed' | 'bill_payment.cancelled';
  transaction: {
    uuid: string;
    reference: string;
    status: 'failed' | 'cancelled';
    amount?: MoneyObject;
  };
  bill_payment?: Record<string, unknown>;
  metadata?: MetadataItem[];
}

/** Discriminated union of all direct callback events */
export type DirectCallbackEvent =
  | CollectionCompletedEvent
  | CollectionFailedEvent
  | DisbursementCompletedEvent
  | DisbursementFailedEvent
  | BillPaymentCompletedEvent
  | BillPaymentFailedEvent;

/** Wrapper envelope for webhooks registered via the MarzPay dashboard API */
export interface DashboardWebhookWrapper<T = DirectCallbackEvent> {
  event_type: string;
  webhook_id: number;
  business_id: number;
  timestamp: string;
  data: T;
}

/** Normalized event returned by SDK webhook parser */
export type ParsedWebhookEvent = DirectCallbackEvent & {
  /** Indicates whether the incoming payload was wrapped in a dashboard envelope */
  is_dashboard_wrapper?: boolean;
  webhook_id?: number;
  business_id?: number;
};
