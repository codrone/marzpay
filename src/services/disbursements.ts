import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  SendMoneyData,
  SendMoneyParams,
  SendMoneyServicesData,
} from '../types';

export class DisbursementsService {
  constructor(private readonly http: HttpClient) {}

  /**
    Send funds (disbursement / payout) to a recipient mobile money wallet.
    
    @param params Disbursement request parameters
    @returns Created payout details with fee deductions and updated wallet balance
   */
  public async send(params: SendMoneyParams): Promise<APIResponseEnvelope<SendMoneyData>> {
    return this.http.request<SendMoneyData>('POST', '/send-money', {
      body: params,
    });
  }

  /**
    List limits and available disbursement services per market.
   */
  public async listServices(): Promise<APIResponseEnvelope<SendMoneyServicesData>> {
    return this.http.request<SendMoneyServicesData>('GET', '/send-money/services');
  }

  /**
    Retrieve disbursement request status by UUID.
    
    @param uuid Transaction UUID returned from disbursement request
   */
  public async getStatus(uuid: string): Promise<APIResponseEnvelope<SendMoneyData>> {
    return this.http.request<SendMoneyData>('GET', `/send-money/${uuid}`);
  }
}
