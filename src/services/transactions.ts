import { HttpClient } from '../utils/http';
import { APIResponseEnvelope, GetTransactionsParams, TransactionListData } from '../types';

export class TransactionsService {
  constructor(private readonly http: HttpClient) {}

  /**
    List and filter historical transactions.
   */
  public async list(
    params: GetTransactionsParams = {}
  ): Promise<APIResponseEnvelope<TransactionListData>> {
    return this.http.request<TransactionListData>('GET', '/transactions', {
      params: {
        page: params.page,
        per_page: params.per_page,
        status: params.status,
        country: params.country,
        currency: params.currency,
        start_date: params.start_date,
        end_date: params.end_date,
      },
    });
  }

  /**
    Retrieve transaction callback payload by UUID.
    Note: Returns callback-shaped event payload starting with event_type.
   */
  public async get(uuid: string): Promise<APIResponseEnvelope<Record<string, unknown>>> {
    return this.http.request<Record<string, unknown>>('GET', `/transactions/${uuid}`);
  }
}
