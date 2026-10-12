import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('DisbursementsService', () => {
  it('should send money payout successfully', async () => {
    const mockResponse = {
      status: 'success',
      message: 'Withdrawal request submitted successfully!',
      data: {
        transaction: {
          uuid: '4e7fb3fa-c13a-4b05-8acd-cf60ff68cb94',
          reference: 'marz-sys-uuid',
          provider_reference: 'payout-2026-07-31-001',
          status: 'pending',
        },
        withdrawal: {
          amount: { formatted: '10,000.00', raw: 10000, currency: 'UGX' },
          charge: { formatted: '500.00', raw: 500, currency: 'UGX' },
          total_deduction: { formatted: '10,500.00', raw: 10500, currency: 'UGX' },
          provider: 'mtn',
          phone_number: '+256712345678',
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

    const res = await client.disbursements.send({
      amount: 10000,
      phone_number: '+256712345678',
      reference: 'payout-2026-07-31-001',
      country: 'UG',
    });

    expect(res.status).toBe('success');
    expect(res.data.withdrawal?.amount.raw).toBe(10000);
    expect(res.data.transaction.provider_reference).toBe('payout-2026-07-31-001');
  });

  it('should auto-generate valid v4 UUID reference when omitted in send()', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ status: 'success', data: {} }),
    });

    const client = new MarzPay({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });

    await client.disbursements.send({
      amount: 10000,
      phone_number: '+256712345678',
      country: 'UG',
    });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    const v4UuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(body.reference).toMatch(v4UuidRegex);
  });
});
