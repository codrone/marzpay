import { HttpClient } from '../utils/http';
import {
  APIResponseEnvelope,
  BankTransferData,
  CreateBankTransferParams,
  RequestOptions,
  SupportedBanksData,
  ValidateBankAccountData,
  ValidateBankAccountParams,
} from '../types';

export class BankTransfersService {
  constructor(private readonly http: HttpClient) {}

  /**
    Validate bank account number and retrieve account holder name before sending funds.
    
    @example
    ```typescript
    const account = await marzpay.bankTransfers.validate({
      account_number: '0123456789',
      bank_name: 'Equity Bank'
    });
    ```
   */
  public async validate(
    params: ValidateBankAccountParams,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<ValidateBankAccountData>> {
    return this.http.request<ValidateBankAccountData>('POST', '/bank-transfer/validate', {
      body: params,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    Create and submit a bank transfer from merchant wallet to bank account.
    
    @example
    ```typescript
    const transfer = await marzpay.bankTransfers.create({
      bank_account_number: '0123456789',
      bank_account_name: 'John Doe',
      bank_name: 'Equity Bank',
      amount: 150000,
      description: 'Vendor payment'
    }, { idempotencyKey: 'idemp-bank-001' });
    ```
   */
  public async create(
    params: CreateBankTransferParams,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<BankTransferData>> {
    return this.http.request<BankTransferData>('POST', '/bank-transfer', {
      body: params,
      headers: options?.headers,
      idempotencyKey: options?.idempotencyKey,
    });
  }

  /**
    Get list of supported commercial banks by country.
   */
  public async listBanks(
    params?: { country?: string },
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<SupportedBanksData>> {
    return this.http.request<SupportedBanksData>('GET', '/bank-transfer/banks', {
      params: params?.country ? { country: params.country } : undefined,
      headers: options?.headers,
    });
  }

  /**
    Check bank transfer status by transaction reference or UUID.
   */
  public async getStatus(
    reference: string,
    options?: RequestOptions
  ): Promise<APIResponseEnvelope<BankTransferData>> {
    return this.http.request<BankTransferData>('GET', `/bank-transfer/${reference}`, {
      headers: options?.headers,
    });
  }
}
