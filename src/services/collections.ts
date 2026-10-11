import { HttpClient } from '../utils/http';
import { sanitizePhoneNumber } from '../utils/phone';
import {
  APIResponseEnvelope,
  CollectionServicesData,
  CreateCollectionData,
  CreateCollectionParams,
  GetCollectionStatusData,
  RequestOptions,
} from '../types';

export class CollectionsService {
  constructor(private readonly http: HttpClient) {}

  /**
    Initiate a mobile money or card collection request.
    
    @param params Collection parameters including amount, reference UUID, and country
    @param options Optional per-request options (e.g. idempotencyKey, custom headers)
    @returns Initiated transaction details and processing info
   */
  public async create(
    params: CreateCollectionParams,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<CreateCollectionData>> {
    const payload = {
      ...params,
      phone_number: params.phone_number
        ? sanitizePhoneNumber(params.phone_number)
        : params.phone_number,
    };
    return this.http.request<CreateCollectionData>('POST', '/collect-money', {
      body: payload,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    List available collection services and providers by country.
   */
  public async listServices(): Promise<APIResponseEnvelope<CollectionServicesData>> {
    return this.http.request<CollectionServicesData>('GET', '/collect-money/services');
  }

  /**
    Retrieve status and details of a collection request by UUID.
    
    @param uuid Transaction UUID returned during collection creation
   */
  public async getStatus(uuid: string): Promise<APIResponseEnvelope<GetCollectionStatusData>> {
    return this.http.request<GetCollectionStatusData>('GET', `/collect-money/${uuid}`);
  }
}
