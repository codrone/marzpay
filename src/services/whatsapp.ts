import { HttpClient } from '../utils/http';
import { WhatsAppBusinessLookupParams, WhatsAppProcessActionParams, WhatsAppResponse } from '../types';

export class WhatsAppService {
  constructor(private readonly http: HttpClient) {}

  /**
    Lookup business details by phone number (Public endpoint)
   */
  public async verifyBusiness(params: WhatsAppBusinessLookupParams): Promise<WhatsAppResponse> {
    const res = await this.http.request<Record<string, unknown>>('POST', '/whatsapp/business-by-phone', {
      body: params,
    });
    return res as unknown as WhatsAppResponse;
  }

  /**
    Process WhatsApp action (Deposit, Send, Utility, Account)
   */
  public async processAction(params: WhatsAppProcessActionParams): Promise<WhatsAppResponse> {
    const res = await this.http.request<Record<string, unknown>>('POST', `/whatsapp/${params.action}`, {
      body: params.payload || { phone_number: params.phone_number },
    });
    return res as unknown as WhatsAppResponse;
  }
}
