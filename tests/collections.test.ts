import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('CollectionsService', () => {
  it('should initiate a mobile money collection', async () => {
    const mockResponseData = {
      status: 'success',
      message: 'Collection initiated successfully.',
      data: {
        transaction: {
          uuid: '4e7fb3fa-c13a-4b05-8acd-cf60ff68cb94',
          reference: 'c97fae8b-9b7f-4192-9f72-6f0859d33e67',
          status: 'processing',
          provider_reference: null,
        },
        collection: {
          amount: { formatted: '5,000.00', raw: 5000, currency: 'UGX' },
          provider: 'mtn',
          phone_number: '+256712345678',
          mode: 'live',
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify(mockResponseData),
    });

    const client = new MarzPay({ apiKey: 'k', apiSecret: 's', fetch: mockFetch as any });

    const response = await client.collections.create({
      amount: 5000,
      phone_number: '+256712345678',
      reference: 'c97fae8b-9b7f-4192-9f72-6f0859d33e67',
      country: 'UG',
    });

    expect(response.status).toBe('success');
    expect(response.data.transaction.status).toBe('processing');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/collect-money',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          amount: 5000,
          phone_number: '+256712345678',
          reference: 'c97fae8b-9b7f-4192-9f72-6f0859d33e67',
          country: 'UG',
        }),
      })
    );
  });

  it('should initiate a card collection with redirect_url', async () => {
    const mockResponseData = {
      status: 'success',
      message: 'Card collection initiated. Redirect the customer to redirect_url.',
      data: {
        transaction: {
          uuid: 'a799c628-f52a-4540-8b77-43509f2775d3',
          reference: 'b59d3d6d-5827-41ee-b455-18dd20ef1c8a',
          status: 'pending',
        },
        redirect_url: 'https://wallet.wearemarz.com/pay/card-gateway?reference=b59d3d6d',
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResponseData),
    });

    const client = new MarzPay({ apiKey: 'k', apiSecret: 's', fetch: mockFetch as any });

    const response = await client.collections.create({
      amount: 5000,
      method: 'card',
      reference: 'b59d3d6d-5827-41ee-b455-18dd20ef1c8a',
      country: 'UG',
    });

    expect(response.status).toBe('success');
    expect((response.data as any).redirect_url).toBe(
      'https://wallet.wearemarz.com/pay/card-gateway?reference=b59d3d6d'
    );
  });
});
