export interface ServiceSubscription {
  uuid: string;
  code: string;
  name: string;
  category: 'collection' | 'disbursement' | 'utility' | 'airtime' | 'verification' | string;
  is_subscribed: boolean;
  status: 'active' | 'pending' | 'disabled' | string;
  requires_ip_whitelist: boolean;
  country: string;
}

export interface ServicesListData {
  services: ServiceSubscription[];
}
