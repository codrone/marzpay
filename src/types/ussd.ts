export interface USSDProcessParams {
  phoneNumber?: string;
  phone_number?: string;
  text?: string;
  sessionId?: string;
  session_id?: string;
}

export interface USSDProcessResponse {
  response?: string;
  endSession?: boolean;
  message?: string;
  action?: 'CON' | 'END' | string;
  session_id?: string;
  sessionId?: string;
}
