import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('ServicesService', () => {
  it('should list subscribed and available services', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        services: [
          {
            uuid: 'svc-001',
            name: 'Collections',
            code: 'COLLECT',
            is_subscribed: true,
          },
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
    const res = await client.services.list();

    expect(res.status).toBe('success');
    expect(res.data.services).toHaveLength(1);
    expect(res.data.services[0]?.name).toBe('Collections');
  });

  it('should get subscription details by uuid', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        uuid: 'svc-001',
        name: 'Collections',
        code: 'COLLECT',
        is_subscribed: true,
        pricing: { tier: 'standard', fee_percentage: 1.5 },
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
    const res = await client.services.get('svc-001');

    expect(res.status).toBe('success');
    expect(res.data.uuid).toBe('svc-001');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/services/svc-001',
      expect.anything()
    );
  });
});
