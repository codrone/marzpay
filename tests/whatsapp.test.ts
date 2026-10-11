import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('WhatsAppService', () => {
  it('should verify business by phone number with phone sanitization', async () => {
    const mockResponse = {
      success: true,
      data: {
        business_id: 101,
        name: 'MarzPay Merchant Ltd',
        phone_number: '+256777123456',
        verified: true,
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
    const res = await client.whatsapp.verifyBusiness({
      phone_number: '+256 (777) 123-456',
    });

    expect(res.success).toBe(true);

    const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.phone_number).toBe('+256777123456');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/whatsapp/business-by-phone',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should process WhatsApp action with route and payload', async () => {
    const mockResponse = {
      success: true,
      data: {
        action: 'deposit',
        status: 'initiated',
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
    const res = await client.whatsapp.processAction({
      action: 'deposit',
      phone_number: '+256 777 123 456',
      payload: { amount: 5000, currency: 'UGX' },
    });

    expect(res.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/whatsapp/deposit',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
