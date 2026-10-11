import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('TransactionsService', () => {
  it('should list transactions with query parameters', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        transactions: [
          {
            uuid: 'tx-001',
            reference: 'ref-001',
            status: 'completed',
            type: 'collection',
            amount: { formatted: '10,000.00', raw: 10000, currency: 'UGX' },
            created_at: '2026-08-01T12:00:00Z',
          },
        ],
        meta: { current_page: 1, last_page: 5, per_page: 15, total: 65 },
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
    const res = await client.transactions.list({
      page: 1,
      per_page: 15,
      status: 'completed',
      country: 'UG',
      currency: 'UGX',
      start_date: '2026-08-01',
      end_date: '2026-08-31',
    });

    expect(res.status).toBe('success');
    expect(res.data.transactions).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/transactions?page=1&per_page=15&status=completed&country=UG&currency=UGX&start_date=2026-08-01&end_date=2026-08-31',
      expect.anything()
    );
  });

  it('should retrieve transaction callback payload by uuid', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        event_type: 'collection.completed',
        transaction: { uuid: 'tx-001', status: 'completed' },
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
    const res = await client.transactions.get('tx-001');

    expect(res.status).toBe('success');
    expect(res.data.event_type).toBe('collection.completed');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/transactions/tx-001',
      expect.anything()
    );
  });
});
