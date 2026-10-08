import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('BalanceService', () => {
  it('should fetch balance for Uganda wallet', async () => {
    const mockBalanceResponse = {
      status: 'success',
      data: {
        account: {
          uuid: '8f6cdf42-44e1-4f9f-a359-09721bb32111',
          business_name: 'MarzPay Business',
          balance: { formatted: '2,503,899.02', raw: 2503899.02, currency: 'UGX' },
          available_balance: { formatted: '2,503,899.02', raw: 2503899.02, currency: 'UGX' },
          total_balance: { formatted: '2,503,899.02', raw: 2503899.02, currency: 'UGX' },
          card_balance: { formatted: '125,000.00', raw: 125000, currency: 'UGX' },
        },
        wallets: [
          {
            currency: 'UGX',
            available_balance: { formatted: '2,503,899.02', raw: 2503899.02, currency: 'UGX' },
            card_balance: { formatted: '125,000.00', raw: 125000, currency: 'UGX' },
            total_balance: { formatted: '2,628,899.02', raw: 2628899.02, currency: 'UGX' },
            withdrawable_balance: { formatted: '2,503,899.02', raw: 2503899.02, currency: 'UGX' },
          },
        ],
        metadata: { country_code: 'UG', currency: 'UGX' },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockBalanceResponse),
    });

    const client = new MarzPay({ apiKey: 'key', apiSecret: 'secret', fetch: mockFetch as any });

    const balanceRes = await client.balance.get({ country: 'UG' });

    expect(balanceRes.status).toBe('success');
    expect(balanceRes.data.account.available_balance.raw).toBe(2503899.02);
    expect(balanceRes.data.metadata.country_code).toBe('UG');
  });

  it('should support DRC USD balance query params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          status: 'success',
          data: {
            account: { available_balance: { raw: 250, currency: 'USD' } },
            metadata: { country_code: 'CD', currency: 'USD' },
          },
        }),
    });

    const client = new MarzPay({ apiKey: 'key', apiSecret: 'secret', fetch: mockFetch as any });

    await client.balance.get({ country: 'CD', currency: 'USD' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/balance?country=CD&currency=USD',
      expect.anything()
    );
  });
});
