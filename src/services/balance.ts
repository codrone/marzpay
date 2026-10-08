import { HttpClient } from '../utils/http';
import {
  AccountBalanceData,
  APIResponseEnvelope,
  BalanceHistoryData,
  GetBalanceHistoryParams,
  GetBalanceParams,
} from '../types';

export class BalanceService {
  constructor(private readonly http: HttpClient) {}

  /**
    Retrieve current merchant wallet balance by country and currency.
    For DRC: send country='CD' and currency='USD' to inspect USD wallet (default is CDF).
   */
  public async get(
    params: GetBalanceParams = {}
  ): Promise<APIResponseEnvelope<AccountBalanceData>> {
    return this.http.request<AccountBalanceData>('GET', '/balance', {
      params: {
        country: params.country,
        currency: params.currency,
      },
    });
  }

  /**
    Retrieve ledger history of credits, debits, and balance snapshots.
   */
  public async getHistory(
    params: GetBalanceHistoryParams = {}
  ): Promise<APIResponseEnvelope<BalanceHistoryData>> {
    return this.http.request<BalanceHistoryData>('GET', '/balance/history', {
      params: {
        country: params.country,
        currency: params.currency,
        page: params.page,
        per_page: params.per_page,
        operation: params.operation,
        type: params.type,
        start_date: params.start_date,
        end_date: params.end_date,
      },
    });
  }
}
