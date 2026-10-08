import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  CollectionServicesData,
  CreateCollectionData,
  CreateCollectionParams,
  GetCollectionStatusData,
} from '../types';

export class CollectionsService {
  constructor(private readonly http: HttpClient) {}

  /**
    Initiate a mobile money or card collection request.
    
    @param params Collection parameters including amount, reference UUID, and country
    @returns Initiated transaction details and processing info
   */
  public async create(
    params: CreateCollectionParams
  ): Promise<APIResponseEnvelope<CreateCollectionData>> {
    return this.http.request<CreateCollectionData>('POST', '/collect-money', {
      body: params,
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
  public async getStatus(
    uuid: string
  ): Promise<APIResponseEnvelope<GetCollectionStatusData>> {
    return this.http.request<GetCollectionStatusData>('GET', `/collect-money/${uuid}`);
  }
}
