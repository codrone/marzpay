import { HttpClient } from '../utils/http';
import { sanitizePhoneNumber } from '../utils/phone';
import {
  APIResponseEnvelope,
  AirtimeCatalogData,
  AirtimePurchaseData,
  AirtimePurchaseParams,
  RequestOptions,
} from '../types';

export class AirtimeService {
  constructor(private readonly http: HttpClient) {}

  /**
    Retrieve available data bundle catalog by network.
   */
  public async getCatalog(
    network?: string,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<AirtimeCatalogData>> {
    return this.http.request<AirtimeCatalogData>('GET', '/airtime-data/catalog', {
      params: { network },
      headers: options?.headers,
    });
  }

  /**
    Detect mobile network operator from MSISDN phone number.
   */
  public async detectNetwork(
    msisdn: string,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<{ network: string; msisdn: string }>> {
    const cleanPhone = sanitizePhoneNumber(msisdn);
    return this.http.request<{ network: string; msisdn: string }>(
      'GET',
      '/airtime-data/detect-network',
      {
        params: { msisdn: cleanPhone },
        headers: options?.headers,
      }
    );
  }

  /**
    Purchase airtime or data bundles for MTN, Airtel, or Lyca.
    
    @example
    ```typescript
    const topup = await marzpay.airtime.purchase({
      reference: 'ref-airtime-001',
      purchase_type: 'airtime',
      msisdn: '+256777123456',
      amount: 5000,
    }, { idempotencyKey: 'idemp-airtime-001' });
    ```
   */
  public async purchase(
    params: AirtimePurchaseParams,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<AirtimePurchaseData>> {
    const payload = {
      ...params,
      msisdn: params.msisdn ? sanitizePhoneNumber(params.msisdn) : params.msisdn,
    };
    return this.http.request<AirtimePurchaseData>('POST', '/airtime-data', {
      body: payload,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    Check status of airtime/data purchase transaction by reference UUID.
   */
  public async getStatus(
    reference: string,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<AirtimePurchaseData>> {
    return this.http.request<AirtimePurchaseData>('GET', `/airtime-data/${reference}`, {
      headers: options?.headers,
    });
  }
}
