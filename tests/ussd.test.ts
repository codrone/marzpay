import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('USSDService', () => {
  it('should process USSD session menu steps', async () => {
    const mockResponse = {
      session_id: 'ussd-sess-100',
      action: 'CON',
      message: '1. Check Balance\n2. Pay Bill\n3. Buy Airtime',
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
    const res = await client.ussd.process({
      sessionId: 'ussd-sess-100',
      phoneNumber: '+256 (777) 123-456',
      text: '',
    });

    expect(res.session_id).toBe('ussd-sess-100');
    expect(res.action).toBe('CON');
    expect(res.message).toContain('Check Balance');

    const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.phoneNumber).toBe('+256777123456');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/ussd/process',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
