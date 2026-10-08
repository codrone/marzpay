import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  AirtimeCatalogData,
  AirtimePurchaseData,
  AirtimePurchaseParams,
} from '../types';

export class AirtimeService {
  constructor(private readonly http: HttpClient) {}

  /**
    Retrieve available data bundle catalog by network.
   */
  public async getCatalog(network?: string): Promise<APIResponseEnvelope<AirtimeCatalogData>> {
    return this.http.request<AirtimeCatalogData>('GET', '/airtime-data/catalog', {
      params: { network },
    });
  }

  /**
    Detect mobile network operator from MSISDN phone number.
   */
  public async detectNetwork(
    msisdn: string
  ): Promise<APIResponseEnvelope<{ network: string; msisdn: string }>> {
    return this.http.request<{ network: string; msisdn: string }>('GET', '/airtime-data/detect-network', {
      params: { msisdn },
    });
  }

  /**
    Purchase airtime or data bundles for MTN, Airtel, or Lyca.
   */
  public async purchase(
    params: AirtimePurchaseParams
  ): Promise<APIResponseEnvelope<AirtimePurchaseData>> {
    return this.http.request<AirtimePurchaseData>('POST', '/airtime-data', {
      body: params,
    });
  }

  /**
    Check status of airtime/data purchase transaction by reference UUID.
   */
  public async getStatus(reference: string): Promise<APIResponseEnvelope<AirtimePurchaseData>> {
    return this.http.request<AirtimePurchaseData>('GET', `/airtime-data/${reference}`);
  }
}
