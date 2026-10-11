import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MarzPay, MarzPayAPIError } from '../src';

describe('End-to-End (E2E) HTTP Integration Tests', () => {
  let server: Server;
  let baseUrl: string;
  const requestLogs: {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body: string;
  }[] = [];
  let rateLimitAttempt = 0;

  beforeAll(async () => {
    server = createServer(async (req, res) => {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }

      const method = req.method || 'GET';
      const url = req.url || '/';
      requestLogs.push({ method, url, headers: req.headers, body });

      // Route 1: Balance Check (Auth & Query Params test)
      if (url.startsWith('/balance')) {
        if (req.headers.authorization !== 'Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'error', message: 'Unauthorized' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'success',
            data: { account: { balance: { formatted: '10,000.00', raw: 10000, currency: 'UGX' } } },
          })
        );
        return;
      }

      // Route 2: Rate Limit Retry Test (429 -> 200)
      if (url.includes('rate-limit-test')) {
        rateLimitAttempt++;
        if (rateLimitAttempt === 1) {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': '0',
          });
          res.end(JSON.stringify({ status: 'error', message: 'Too Many Requests' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', data: { retried: true } }));
        return;
      }

      // Route 3: 204 No Content
      if (url.includes('empty-response')) {
        res.writeHead(204);
        res.end();
        return;
      }

      // Route 4: HTML Proxy Error (502 Bad Gateway)
      if (url.includes('html-error')) {
        res.writeHead(502, { 'Content-Type': 'text/html' });
        res.end(
          '<html><head><title>502 Bad Gateway</title></head><body><h1>502 Bad Gateway</h1><p>Cloudflare Proxy Error</p></body></html>'
        );
        return;
      }

      // Route 5: Collection Creation (Idempotency Key & Phone Sanitization test)
      if (url.startsWith('/collect-money')) {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'success',
            message: 'Collection initiated',
            data: {
              transaction: { uuid: 'tx-e2e-001', status: 'processing' },
              collection: JSON.parse(body),
            },
          })
        );
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not Found' }));
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should execute real HTTP request over TCP and verify Basic Auth header', async () => {
    const client = new MarzPay({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      baseUrl,
    });

    const response = await client.balance.get({ country: 'UG' });

    expect(response.status).toBe('success');
    expect(response.data.account.balance.raw).toBe(10000);

    const lastLog = requestLogs[requestLogs.length - 1];
    expect(lastLog.headers.authorization).toBe('Basic dGVzdF9rZXk6dGVzdF9zZWNyZXQ=');
    expect(lastLog.url).toBe('/balance?country=UG');
  });

  it('should sanitize phone numbers and forward custom Idempotency-Key over HTTP', async () => {
    const client = new MarzPay({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      baseUrl,
    });

    const response = await client.collections.create(
      {
        amount: 5000,
        phone_number: '+256 (777) 123-456',
        reference: 'ref-e2e-001',
        country: 'UG',
      },
      { idempotencyKey: 'idemp-e2e-custom-123' }
    );

    expect(response.status).toBe('success');
    const lastLog = requestLogs[requestLogs.length - 1];
    expect(lastLog.headers['idempotency-key']).toBe('idemp-e2e-custom-123');

    const receivedBody = JSON.parse(lastLog.body);
    expect(receivedBody.phone_number).toBe('+256777123456');
  });

  it('should automatically retry HTTP 429 Rate Limit with Retry-After header', async () => {
    const client = new MarzPay({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      baseUrl,
      maxRetries: 2,
    });

    const response = await client.transactions.get('rate-limit-test');

    expect(response.status).toBe('success');
    expect((response.data as { retried: boolean }).retried).toBe(true);
    expect(rateLimitAttempt).toBe(2);
  });

  it('should handle 204 No Content empty responses without JSON parse errors', async () => {
    const client = new MarzPay({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      baseUrl,
    });

    const response = await client.transactions.get('empty-response');

    expect(response.status).toBe('success');
    expect(response.data).toBeNull();
  });

  it('should handle 502 HTML Proxy Error pages gracefully without SyntaxError crash', async () => {
    const client = new MarzPay({
      apiKey: 'test_key',
      apiSecret: 'test_secret',
      baseUrl,
      maxRetries: 0,
    });

    try {
      await client.transactions.get('html-error');
      expect.fail('Should have thrown MarzPayAPIError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(MarzPayAPIError);
      const apiErr = err as MarzPayAPIError;
      expect(apiErr.statusCode).toBe(502);
      expect(apiErr.message).toContain('502 Bad Gateway Cloudflare Proxy Error');
    }
  });
});
