import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('BankTransfersService', () => {
  it('should validate bank account details', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        account_name: 'John Doe',
        account_number: '0123456789',
        bank_name: 'Equity Bank',
        is_valid: true,
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResponse),
    });

    const client = new MarzPay({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });
    const res = await client.bankTransfers.validate({
      bank_name: 'Equity Bank',
      account_number: '0123456789',
    });

    expect(res.status).toBe('success');
    expect(res.data.is_valid).toBe(true);
    expect(res.data.account_name).toBe('John Doe');
  });

  it('should create bank transfer with idempotency key', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        bank_transfer: {
          reference: 'ref-bank-001',
          amount: { formatted: '150,000.00', raw: 150000, currency: 'UGX' },
          status: 'processing',
          bank_details: {
            bank_name: 'Equity Bank',
            account_name: 'John Doe',
            account_number: '0123456789',
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify(mockResponse),
    });

    const client = new MarzPay({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });
    const res = await client.bankTransfers.create(
      {
        amount: 150000,
        bank_name: 'Equity Bank',
        bank_account_number: '0123456789',
        bank_account_name: 'John Doe',
        description: 'Vendor payment',
      },
      { idempotencyKey: 'idemp-bank-001' }
    );

    expect(res.status).toBe('success');
    expect(res.data.bank_transfer?.status).toBe('processing');

    const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('idemp-bank-001');
  });

  it('should list supported banks with optional country filter', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        banks: [
          { code: 'EQTY', name: 'Equity Bank', country: 'UG' },
          { code: 'STNB', name: 'Stanbic Bank', country: 'UG' },
        ],
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResponse),
    });

    const client = new MarzPay({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });
    const res = await client.bankTransfers.listBanks({ country: 'UG' });

    expect(res.status).toBe('success');
    expect(res.data.banks).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/bank-transfer/banks?country=UG',
      expect.anything()
    );
  });

  it('should check bank transfer status by reference', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        bank_transfer: {
          reference: 'ref-bank-001',
          amount: { formatted: '150,000.00', raw: 150000, currency: 'UGX' },
          status: 'completed',
          bank_details: {
            bank_name: 'Equity Bank',
            account_name: 'John Doe',
            account_number: '0123456789',
          },
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResponse),
    });

    const client = new MarzPay({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });
    const res = await client.bankTransfers.getStatus('ref-bank-001');

    expect(res.status).toBe('success');
    expect(res.data.bank_transfer?.status).toBe('completed');
  });
});
