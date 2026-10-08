import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  CreatePaymentLinkParams,
  ListPaymentLinksParams,
  PaymentLinkData,
  PaymentLinkRecord,
} from '../types';

export class PaymentLinksService {
  constructor(private readonly http: HttpClient) {}

  /**
    Create hosted payment link.
   */
  public async create(
    params: CreatePaymentLinkParams
  ): Promise<APIResponseEnvelope<PaymentLinkData>> {
    return this.http.request<PaymentLinkData>('POST', '/payment-links', {
      body: params,
    });
  }

  /**
    List payment links.
   */
  public async list(
    params: ListPaymentLinksParams = {}
  ): Promise<APIResponseEnvelope<{ payment_links: PaymentLinkRecord[] }>> {
    return this.http.request<{ payment_links: PaymentLinkRecord[] }>('GET', '/payment-links', {
      params: {
        country: params.country,
        currency: params.currency,
        page: params.page,
        per_page: params.per_page,
      },
    });
  }

  /**
    Get payment link details by UUID.
   */
  public async get(uuid: string): Promise<APIResponseEnvelope<PaymentLinkData>> {
    return this.http.request<PaymentLinkData>('GET', `/payment-links/${uuid}`);
  }

  /**
    Update existing payment link details by UUID.
   */
  public async update(
    uuid: string,
    params: Partial<CreatePaymentLinkParams>
  ): Promise<APIResponseEnvelope<PaymentLinkData>> {
    return this.http.request<PaymentLinkData>('PUT', `/payment-links/${uuid}`, {
      body: params,
    });
  }

  /**
    Delete payment link by UUID.
   */
  public async delete(uuid: string): Promise<APIResponseEnvelope<{ message: string }>> {
    return this.http.request<{ message: string }>('DELETE', `/payment-links/${uuid}`);
  }
}
