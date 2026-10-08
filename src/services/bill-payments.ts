import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  PayBillData,
  PayBillParams,
  TVBouquet,
  VerifyBillData,
  VerifyBillParams,
} from '../types';

export class BillPaymentsService {
  constructor(private readonly http: HttpClient) {}

  /**
    Verify meter, account number, or smartcard before paying utility bills.
   */
  public async verify(
    params: VerifyBillParams
  ): Promise<APIResponseEnvelope<VerifyBillData>> {
    return this.http.request<VerifyBillData>('POST', '/bill-payment/verify', {
      body: params,
    });
  }

  /**
    Pay electricity (LIGHT), water (NWSC), or TV (DSTV/GOTV) bill.
   */
  public async pay(params: PayBillParams): Promise<APIResponseEnvelope<PayBillData>> {
    return this.http.request<PayBillData>('POST', '/bill-payment', {
      body: params,
    });
  }

  /**
    List past bill payment transactions.
   */
  public async listTransactions(): Promise<APIResponseEnvelope<Record<string, unknown>>> {
    return this.http.request<Record<string, unknown>>('GET', '/bill-payment');
  }

  /**
    Get status of a bill payment by reference.
   */
  public async getStatus(reference: string): Promise<APIResponseEnvelope<PayBillData>> {
    return this.http.request<PayBillData>('GET', `/bill-payment/${reference}`);
  }

  /**
    Get supported NWSC areas.
   */
  public async getNWSCAreas(): Promise<APIResponseEnvelope<{ areas: string[] }>> {
    return this.http.request<{ areas: string[] }>('GET', '/bill-payment/nwsc/areas');
  }

  /**
    Get DSTV bouquet codes and pricing.
   */
  public async getDSTVBouquets(): Promise<APIResponseEnvelope<{ bouquets: TVBouquet[] }>> {
    return this.http.request<{ bouquets: TVBouquet[] }>('GET', '/bill-payment/dstv/bouquet-codes');
  }

  /**
    Get GOTV bouquet codes and pricing.
   */
  public async getGOTVBouquets(): Promise<APIResponseEnvelope<{ bouquets: TVBouquet[] }>> {
    return this.http.request<{ bouquets: TVBouquet[] }>('GET', '/bill-payment/gotv/bouquet-codes');
  }
}
