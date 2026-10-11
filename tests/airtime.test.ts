import { describe, expect, it, vi } from 'vitest';
import { MarzPay } from '../src';

describe('AirtimeService', () => {
  it('should fetch data bundle catalog', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        network: 'MTN',
        bundles: [{ id: 'RACT_UG_Data_201', name: '1GB Daily', price: 5000, network: 'MTN' }],
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
    const res = await client.airtime.getCatalog('MTN');

    expect(res.status).toBe('success');
    expect(res.data.bundles[0]?.id).toBe('RACT_UG_Data_201');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/airtime-data/catalog?network=MTN',
      expect.anything()
    );
  });

  it('should detect network from msisdn with phone sanitization', async () => {
    const mockResponse = {
      status: 'success',
      data: { network: 'MTN', msisdn: '+256777123456' },
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
    const res = await client.airtime.detectNetwork('+256 (777) 123-456');

    expect(res.status).toBe('success');
    expect(res.data.network).toBe('MTN');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/airtime-data/detect-network?msisdn=%2B256777123456',
      expect.anything()
    );
  });

  it('should purchase airtime and forward sanitized msisdn and idempotency key', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        uuid: 'airtime-tx-001',
        reference: 'ref-airtime-123',
        status: 'completed',
        amount: { formatted: '5,000.00', raw: 5000, currency: 'UGX' },
        airtime_data: {
          network: 'MTN',
          purchase_type: 'airtime',
          msisdn: '+256777123456',
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
    const res = await client.airtime.purchase(
      {
        reference: 'ref-airtime-123',
        purchase_type: 'airtime',
        msisdn: '+256 777 123 456',
        amount: 5000,
      },
      { idempotencyKey: 'idemp-airtime-123' }
    );

    expect(res.status).toBe('success');
    expect(res.data.uuid).toBe('airtime-tx-001');

    const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.msisdn).toBe('+256777123456');
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('idemp-airtime-123');
  });

  it('should fetch airtime status by reference', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        uuid: 'airtime-tx-001',
        reference: 'ref-airtime-123',
        status: 'completed',
        amount: { formatted: '5,000.00', raw: 5000, currency: 'UGX' },
        airtime_data: {
          network: 'MTN',
          purchase_type: 'airtime',
          msisdn: '+256777123456',
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
    const res = await client.airtime.getStatus('ref-airtime-123');

    expect(res.status).toBe('success');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/airtime-data/ref-airtime-123',
      expect.anything()
    );
  });
});
