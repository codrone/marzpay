import { HttpClient } from '../utils/http';
import { sanitizePhoneNumber } from '../utils/phone';
import { USSDProcessParams, USSDProcessResponse } from '../types';

export class USSDService {
  constructor(private readonly http: HttpClient) {}

  /**
    Process USSD gateway menu step.
   */
  public async process(params: USSDProcessParams): Promise<USSDProcessResponse> {
    const rawPhone = params.phoneNumber || params.phone_number;
    const cleanPhone = rawPhone ? sanitizePhoneNumber(rawPhone) : rawPhone;
    const payload = {
      ...params,
      ...(cleanPhone ? { phoneNumber: cleanPhone, phone_number: cleanPhone } : {}),
    };
    const res = await this.http.request<USSDProcessResponse>('POST', '/ussd/process', {
      body: payload,
    });
    const data =
      res.data && typeof res.data === 'object' ? res.data : (res as unknown as USSDProcessResponse);
    return data;
  }
}
