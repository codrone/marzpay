import { HttpClient } from '../utils/http';
import { sanitizePhoneNumber } from '../utils/phone';
import {
  WhatsAppBusinessLookupParams,
  WhatsAppProcessActionParams,
  WhatsAppResponse,
} from '../types';

export class WhatsAppService {
  constructor(private readonly http: HttpClient) {}

  /**
    Lookup business details by phone number (Public endpoint)
   */
  public async verifyBusiness(params: WhatsAppBusinessLookupParams): Promise<WhatsAppResponse> {
    const payload = {
      ...params,
      phone_number: params.phone_number
        ? sanitizePhoneNumber(params.phone_number)
        : params.phone_number,
    };
    const res = await this.http.request<Record<string, unknown>>(
      'POST',
      '/whatsapp/business-by-phone',
      {
        body: payload,
      }
    );
    return res as unknown as WhatsAppResponse;
  }

  /**
    Process WhatsApp action (Deposit, Send, Utility, Account)
   */
  public async processAction(params: WhatsAppProcessActionParams): Promise<WhatsAppResponse> {
    const cleanPhone = params.phone_number
      ? sanitizePhoneNumber(params.phone_number)
      : params.phone_number;
    const body = params.payload || { phone_number: cleanPhone };
    const res = await this.http.request<Record<string, unknown>>(
      'POST',
      `/whatsapp/${params.action}`,
      {
        body,
      }
    );
    return res as unknown as WhatsAppResponse;
  }
}
