import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  CreatePaymentLinkParams,
  ListPaymentLinksParams,
  PaymentLinkData,
  PaymentLinkRecord,
  RequestOptions,
} from '../types';

export class PaymentLinksService {
  constructor(private readonly http: HttpClient) {}

  /**
    Create hosted payment link.
    
    @example
    ```typescript
    const link = await marzpay.paymentLinks.create({
      title: 'Invoice Payment #102',
      amount: 50000,
      currency: 'UGX',
      country: 'UG'
    }, { idempotencyKey: 'idemp-link-102' });
    ```
   */
  public async create(
    params: CreatePaymentLinkParams,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<PaymentLinkData>> {
    return this.http.request<PaymentLinkData>('POST', '/payment-links', {
      body: params,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    List payment links.
   */
  public async list(
    params: ListPaymentLinksParams = {},
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<{ payment_links: PaymentLinkRecord[] }>> {
    return this.http.request<{ payment_links: PaymentLinkRecord[] }>('GET', '/payment-links', {
      params: {
        country: params.country,
        currency: params.currency,
        page: params.page,
        per_page: params.per_page,
      },
      headers: options?.headers,
    });
  }

  /**
    Get payment link details by UUID.
   */
  public async get(
    uuid: string,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<PaymentLinkData>> {
    return this.http.request<PaymentLinkData>('GET', `/payment-links/${uuid}`, {
      headers: options?.headers,
    });
  }

  /**
    Update existing payment link details by UUID.
   */
  public async update(
    uuid: string,
    params: Partial<CreatePaymentLinkParams>,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<PaymentLinkData>> {
    return this.http.request<PaymentLinkData>('PUT', `/payment-links/${uuid}`, {
      body: params,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    Delete payment link by UUID.
   */
  public async delete(
    uuid: string,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<{ message: string }>> {
    return this.http.request<{ message: string }>('DELETE', `/payment-links/${uuid}`, {
      headers: options?.headers,
    });
  }
}
