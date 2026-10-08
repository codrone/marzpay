import { HttpClient } from '../utils/http';
import { USSDProcessParams, USSDProcessResponse } from '../types';

export class USSDService {
  constructor(private readonly http: HttpClient) {}

  /**
    Process USSD gateway menu step.
   */
  public async process(params: USSDProcessParams): Promise<USSDProcessResponse> {
    const res = await this.http.request<USSDProcessResponse>('POST', '/ussd/process', {
      body: params,
    });
    return res as unknown as USSDProcessResponse;
  }
}
