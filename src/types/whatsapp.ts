export interface WhatsAppBusinessLookupParams {
  phone_number: string;
}

export interface WhatsAppProcessActionParams {
  phone_number: string;
  action: string;
  payload?: Record<string, unknown>;
}

export interface WhatsAppResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}
