import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  BankTransferData,
  CreateBankTransferParams,
  SupportedBanksData,
  ValidateBankAccountData,
  ValidateBankAccountParams,
} from '../types';

export class BankTransfersService {
  constructor(private readonly http: HttpClient) {}

  /**
    Validate bank account number and retrieve account holder name before sending funds.
   */
  public async validate(
    params: ValidateBankAccountParams
  ): Promise<APIResponseEnvelope<ValidateBankAccountData>> {
    return this.http.request<ValidateBankAccountData>('POST', '/bank-transfer/validate', {
      body: params,
    });
  }

  /**
    Create and submit a bank transfer from merchant wallet to bank account.
   */
  public async create(
    params: CreateBankTransferParams
  ): Promise<APIResponseEnvelope<BankTransferData>> {
    return this.http.request<BankTransferData>('POST', '/bank-transfer', {
      body: params,
    });
  }

  /**
    Get list of supported commercial banks.
   */
  public async listBanks(): Promise<APIResponseEnvelope<SupportedBanksData>> {
    return this.http.request<SupportedBanksData>('GET', '/bank-transfer/banks');
  }

  /**
    Check bank transfer status by transaction reference or UUID.
   */
  public async getStatus(reference: string): Promise<APIResponseEnvelope<BankTransferData>> {
    return this.http.request<BankTransferData>('GET', `/bank-transfer/${reference}`);
  }
}
