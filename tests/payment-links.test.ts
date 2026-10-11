import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('PaymentLinksService', () => {
  it('should create hosted payment link', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        payment_link: {
          uuid: 'link-uuid-101',
          title: 'Invoice Payment #102',
          amount: 50000,
          currency: 'UGX',
          payment_url: 'https://pay.wearemarz.com/link-uuid-101',
          is_active: true,
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
    const res = await client.paymentLinks.create(
      {
        title: 'Invoice Payment #102',
        amount: 50000,
        currency: 'UGX',
        country: 'UG',
      },
      { idempotencyKey: 'idemp-link-102' }
    );

    expect(res.status).toBe('success');
    expect(res.data.payment_link.uuid).toBe('link-uuid-101');
    expect(res.data.payment_link.payment_url).toContain('pay.wearemarz.com');
  });

  it('should list and filter payment links with query params', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        payment_links: [
          { uuid: 'link-1', title: 'Plan A', amount: 10000, currency: 'UGX', is_active: true },
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
    const res = await client.paymentLinks.list({
      country: 'UG',
      currency: 'UGX',
      page: 1,
      per_page: 10,
    });

    expect(res.status).toBe('success');
    expect(res.data.payment_links).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/payment-links?country=UG&currency=UGX&page=1&per_page=10',
      expect.anything()
    );
  });

  it('should retrieve payment link by uuid', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        payment_link: { uuid: 'link-1', title: 'Plan A', amount: 10000, currency: 'UGX' },
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
    const res = await client.paymentLinks.get('link-1');

    expect(res.status).toBe('success');
    expect(res.data.payment_link.uuid).toBe('link-1');
  });

  it('should update payment link details', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        payment_link: { uuid: 'link-1', title: 'Plan A (Updated)', amount: 12000, currency: 'UGX' },
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
    const res = await client.paymentLinks.update('link-1', {
      amount: 12000,
      title: 'Plan A (Updated)',
    });

    expect(res.status).toBe('success');
    expect(res.data.payment_link.amount).toBe(12000);
  });

  it('should delete payment link', async () => {
    const mockResponse = {
      status: 'success',
      data: { message: 'Payment link deactivated successfully' },
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
    const res = await client.paymentLinks.delete('link-1');

    expect(res.status).toBe('success');
    expect(res.data.message).toContain('deactivated');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/payment-links/link-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
