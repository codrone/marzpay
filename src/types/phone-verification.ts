export interface VerifyPhoneParams {
  phone_number: string;
}

export interface VerifiedSubscriberData {
  phone_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  verification_status: 'verified' | 'unverified' | string;
}

export interface VerifyPhoneResponse {
  success: boolean;
  message: string;
  data: VerifiedSubscriberData;
  phone_number?: string;
  verified_at?: string;
}
