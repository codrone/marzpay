export interface USSDProcessParams {
  phoneNumber: string;
  text: string;
  sessionId: string;
}

export interface USSDProcessResponse {
  response: string;
  endSession: boolean;
}
