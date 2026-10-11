import { HttpClient } from '../utils/http';
import { sanitizePhoneNumber } from '../utils/phone';
import {
  APIResponseEnvelope,
  RequestOptions,
  VerifyPhoneParams,
  VerifyPhoneResponse,
} from '../types';

export class PhoneVerificationService {
  constructor(private readonly http: HttpClient) {}

  /**
    Verify Uganda phone number and retrieve registered subscriber KYC details.
    
    @example
    ```typescript
    const subscriber = await marzpay.phoneVerification.verify({
      phone_number: '+256777123456'
    });
    ```
   */
  public async verify(
    params: VerifyPhoneParams,
    options?: RequestOptions
  ): Promise<VerifyPhoneResponse> {
    const payload = {
      ...params,
      phone_number: params.phone_number
        ? sanitizePhoneNumber(params.phone_number)
        : params.phone_number,
    };
    const res = await this.http.request<Record<string, unknown>>(
      'POST',
      '/phone-verification/verify',
      {
        body: payload,
        headers: options?.headers,
        idempotencyKey: options?.idempotencyKey,
      }
    );
    return res as unknown as VerifyPhoneResponse;
  }

  /**
    Get service info and quota limits for phone verification API.
   */
  public async getServiceInfo(
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<Record<string, unknown>>> {
    return this.http.request<Record<string, unknown>>('GET', '/phone-verification/service-info', {
      headers: options?.headers,
    });
  }
}
