import { generateUUID } from '../utils/crypto';
import { HttpClient } from '../utils/http';
import { sanitizePhoneNumber } from '../utils/phone';
import {
  APIResponseEnvelope,
  PayBillData,
  PayBillParams,
  RequestOptions,
  TVBouquet,
  VerifyBillData,
  VerifyBillParams,
} from '../types';

export class BillPaymentsService {
  constructor(private readonly http: HttpClient) {}

  /**
    Verify meter, account number, or smartcard before paying utility bills.
    
    @example
    ```typescript
    const verification = await marzpay.billPayments.verify({
      utility_code: 'NWSC',
      meter_number: '14234567890',
      area: 'Kampala'
    });
    ```
   */
  public async verify(
    params: VerifyBillParams,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<VerifyBillData>> {
    return this.http.request<VerifyBillData>('POST', '/bill-payment/verify', {
      body: params,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    Pay electricity (LIGHT), water (NWSC), or TV (DSTV/GOTV) bill.
    
    @example
    ```typescript
    const payment = await marzpay.billPayments.pay({
      reference: 'ref-bill-001',
      utility_code: 'NWSC',
      meter_number: '14234567890',
      phone_number: '+256777123456',
      amount: 20000,
      area: 'Kampala'
    }, { idempotencyKey: 'idemp-bill-001' });
    ```
   */
  public async pay(
    params: PayBillParams,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<PayBillData>> {
    const payload = {
      ...params,
      reference: params.reference || generateUUID(),
      phone_number: params.phone_number
        ? sanitizePhoneNumber(params.phone_number)
        : params.phone_number,
    };
    return this.http.request<PayBillData>('POST', '/bill-payment', {
      body: payload,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    List past bill payment transactions.
   */
  public async listTransactions(
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<Record<string, unknown>>> {
    return this.http.request<Record<string, unknown>>('GET', '/bill-payment', {
      headers: options?.headers,
    });
  }

  /**
    Get status of a bill payment by reference.
   */
  public async getStatus(
    reference: string,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<PayBillData>> {
    return this.http.request<PayBillData>('GET', `/bill-payment/${reference}`, {
      headers: options?.headers,
    });
  }

  /**
    Get supported NWSC areas.
   */
  public async getNWSCAreas(
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<{ areas: string[] }>> {
    return this.http.request<{ areas: string[] }>('GET', '/bill-payment/nwsc/areas', {
      headers: options?.headers,
    });
  }

  /**
    Get DSTV bouquet codes and pricing.
   */
  public async getDSTVBouquets(
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<{ bouquets: TVBouquet[] }>> {
    return this.http.request<{ bouquets: TVBouquet[] }>('GET', '/bill-payment/dstv/bouquet-codes', {
      headers: options?.headers,
    });
  }

  /**
    Get GOTV bouquet codes and pricing.
   */
  public async getGOTVBouquets(
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<{ bouquets: TVBouquet[] }>> {
    return this.http.request<{ bouquets: TVBouquet[] }>('GET', '/bill-payment/gotv/bouquet-codes', {
      headers: options?.headers,
    });
  }
}
