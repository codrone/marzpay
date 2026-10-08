import { HttpClient } from '../utils/http';
import { APIResponseEnvelope, ServicesListData, ServiceSubscription } from '../types';

export class ServicesService {
  constructor(private readonly http: HttpClient) {}

  /**
    List all available and subscribed merchant services.
   */
  public async list(): Promise<APIResponseEnvelope<ServicesListData>> {
    return this.http.request<ServicesListData>('GET', '/services');
  }

  /**
    Get service subscription details by UUID.
   */
  public async get(uuid: string): Promise<APIResponseEnvelope<ServiceSubscription>> {
    return this.http.request<ServiceSubscription>('GET', `/services/${uuid}`);
  }
}
