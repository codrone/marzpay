import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('PhoneVerificationService', () => {
  it('should verify subscriber KYC details with sanitized phone number', async () => {
    const mockResponse = {
      success: true,
      message: 'Subscriber verified successfully',
      data: {
        phone_number: '+256777123456',
        first_name: 'Ronald',
        last_name: 'Mpala',
        full_name: 'Ronald Mpala',
        verification_status: 'verified',
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
    const res = await client.phoneVerification.verify(
      { phone_number: '+256 (777) 123-456' },
      { idempotencyKey: 'idemp-verify-001' }
    );

    expect(res.success).toBe(true);
    expect(res.data.full_name).toBe('Ronald Mpala');
    expect(res.data.verification_status).toBe('verified');

    const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.phone_number).toBe('+256777123456');
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('idemp-verify-001');
  });

  it('should fetch phone verification service quota info', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        quota_remaining: 500,
        quota_total: 1000,
        price_per_lookup: 200,
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
    const res = await client.phoneVerification.getServiceInfo();

    expect(res.status).toBe('success');
    expect(res.data.quota_remaining).toBe(500);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/phone-verification/service-info',
      expect.anything()
    );
  });
});
