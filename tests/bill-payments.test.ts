import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('BillPaymentsService', () => {
  it('should verify utility meter details', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        customer_details: {
          customer_name: 'John Doe',
          area: 'Kampala',
          outstanding_balance: 0,
        },
        utility_code: 'NWSC',
        meter_number: '14234567890',
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
    const res = await client.billPayments.verify({
      utility_code: 'NWSC',
      meter_number: '14234567890',
      area: 'Kampala',
    });

    expect(res.status).toBe('success');
    expect(res.data.customer_details.customer_name).toBe('John Doe');
  });

  it('should submit bill payment and sanitize phone number', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        transaction: {
          uuid: 'tx-bill-001',
          reference: 'ref-bill-001',
          status: 'completed',
        },
        bill_payment: {
          utility_code: 'NWSC',
          meter_number: '14234567890',
          amount: { formatted: '20,000.00', raw: 20000, currency: 'UGX' },
        },
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
    const res = await client.billPayments.pay(
      {
        reference: 'ref-bill-001',
        utility_code: 'NWSC',
        meter_number: '14234567890',
        phone_number: '+256 (777) 123-456',
        amount: 20000,
        area: 'Kampala',
      },
      { idempotencyKey: 'idemp-bill-001' }
    );

    expect(res.status).toBe('success');
    expect(res.data.transaction.status).toBe('completed');

    const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.phone_number).toBe('+256777123456');
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('idemp-bill-001');
  });

  it('should fetch NWSC areas', async () => {
    const mockResponse = {
      status: 'success',
      data: { areas: ['Kampala', 'Entebbe', 'Jinja'] },
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
    const res = await client.billPayments.getNWSCAreas();

    expect(res.status).toBe('success');
    expect(res.data.areas).toContain('Kampala');
  });

  it('should fetch DSTV and GOTV bouquet codes', async () => {
    const mockDSTV = {
      status: 'success',
      data: {
        bouquets: [{ code: 'PRM', name: 'Premium', price: 250000 }],
      },
    };
    const mockGOTV = {
      status: 'success',
      data: {
        bouquets: [{ code: 'SUPA', name: 'Supa', price: 65000 }],
      },
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockDSTV),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockGOTV),
      });

    const client = new MarzPay({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });

    const dstvRes = await client.billPayments.getDSTVBouquets();
    expect(dstvRes.data.bouquets[0]?.code).toBe('PRM');

    const gotvRes = await client.billPayments.getGOTVBouquets();
    expect(gotvRes.data.bouquets[0]?.code).toBe('SUPA');
  });

  it('should list past bill payment transactions and get status', async () => {
    const mockList = {
      status: 'success',
      data: { transactions: [] },
    };
    const mockStatus = {
      status: 'success',
      data: {
        transaction: { uuid: 'tx-001', reference: 'ref-001', status: 'completed' },
        bill_payment: {
          utility_code: 'LIGHT',
          meter_number: '0101',
          amount: { formatted: '10,000.00', raw: 10000, currency: 'UGX' },
        },
      },
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockList),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockStatus),
      });

    const client = new MarzPay({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });

    const listRes = await client.billPayments.listTransactions();
    expect(listRes.status).toBe('success');

    const statusRes = await client.billPayments.getStatus('ref-001');
    expect(statusRes.data.transaction.status).toBe('completed');
  });
});
