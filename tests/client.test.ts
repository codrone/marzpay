import { describe, expect, it, vi } from 'vitest';
import { MarzPay, MarzPayAuthenticationError, MarzPayValidationError } from '../src';

describe('MarzPay Client', () => {
  it('should initialize all sub-services correctly', () => {
    const client = new MarzPay({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      webhookSecret: 'whsec_test123',
    });

    expect(client.collections).toBeDefined();
    expect(client.disbursements).toBeDefined();
    expect(client.bankTransfers).toBeDefined();
    expect(client.billPayments).toBeDefined();
    expect(client.airtime).toBeDefined();
    expect(client.phoneVerification).toBeDefined();
    expect(client.balance).toBeDefined();
    expect(client.transactions).toBeDefined();
    expect(client.paymentLinks).toBeDefined();
    expect(client.services).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.whatsapp).toBeDefined();
    expect(client.ussd).toBeDefined();
  });

  it('should include HTTP Basic auth headers in requests', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'success', data: { account: { balance: { raw: 1000 } } } }),
    });

    const client = new MarzPay({
      apiKey: 'my_key',
      apiSecret: 'my_secret',
      fetch: mockFetch as any,
    });

    await client.balance.get({ country: 'UG' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://wallet.wearemarz.com/api/v1/balance?country=UG');
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Basic ${btoa('my_key:my_secret')}`);
  });

  it('should throw MarzPayAuthenticationError on 401 response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: 'Invalid API Key' }),
    });

    const client = new MarzPay({
      apiKey: 'invalid',
      apiSecret: 'invalid',
      fetch: mockFetch as any,
    });

    await expect(client.balance.get()).rejects.toThrow(MarzPayAuthenticationError);
  });

  it('should throw MarzPayValidationError on 422 response with errors payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () =>
        JSON.stringify({
          message: 'The given data was invalid.',
          errors: { amount: ['The amount field is required.'] },
        }),
    });

    const client = new MarzPay({
      apiKey: 'key',
      apiSecret: 'secret',
      fetch: mockFetch as any,
    });

    try {
      await client.collections.create({
        amount: 0,
        reference: '123',
        country: 'UG',
      });
      expect.fail('Should have thrown MarzPayValidationError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(MarzPayValidationError);
      expect(err.statusCode).toBe(422);
      expect(err.errors.amount).toContain('The amount field is required.');
    }
  });
});
