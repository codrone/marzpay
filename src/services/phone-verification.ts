import { HttpClient } from '../utils/http';
import { APIResponseEnvelope, VerifyPhoneParams, VerifyPhoneResponse } from '../types';

export class PhoneVerificationService {
  constructor(private readonly http: HttpClient) {}

  /**
    Verify Uganda phone number and retrieve registered subscriber KYC details.
   */
  public async verify(params: VerifyPhoneParams): Promise<VerifyPhoneResponse> {
    const res = await this.http.request<Record<string, unknown>>(
      'POST',
      '/phone-verification/verify',
      { body: params }
    );
    return res as unknown as VerifyPhoneResponse;
  }

  /**
    Get service info and quota limits for phone verification API.
   */
  public async getServiceInfo(): Promise<APIResponseEnvelope<Record<string, unknown>>> {
    return this.http.request<Record<string, unknown>>(
      'GET',
      '/phone-verification/service-info'
    );
  }
}
