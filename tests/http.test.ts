import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../src/utils/http';
import {
  MarzPayAPIError,
  MarzPayAuthenticationError,
  MarzPayNetworkError,
  MarzPayRateLimitError,
} from '../src';

describe('HttpClient Deep Portability & Edge Cases', () => {
  it('should normalize trailing slashes on baseUrl', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'success', data: { ok: true } }),
    });

    const client = new HttpClient({
      baseUrl: 'https://wallet.wearemarz.com/api/v1///',
      apiKey: 'key',
      apiSecret: 'secret',
      fetch: mockFetch as unknown as typeof fetch,
    });

    await client.request('GET', '/test');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://wallet.wearemarz.com/api/v1/test',
      expect.anything()
    );
  });

  it('should support UTF-8 characters in API key and secret without crash', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'success', data: {} }),
    });

    const client = new HttpClient({
      apiKey: 'clé_client_123',
      apiSecret: 'secret_€_accentué',
      fetch: mockFetch as unknown as typeof fetch,
    });

    await client.request('GET', '/balance');
    expect(mockFetch).toHaveBeenCalledOnce();
    const init = mockFetch.mock.calls[0]?.[1] as RequestInit;
    const authHeader = (init.headers as Record<string, string>)?.Authorization;
    expect(authHeader).toMatch(/^Basic /);
  });

  it('should serialize array parameters in query string properly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'success', data: {} }),
    });

    const client = new HttpClient({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });

    await client.request('GET', '/filter', {
      params: {
        statuses: ['completed', 'pending'],
        country: 'UG',
      },
    });

    const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('statuses=completed');
    expect(calledUrl).toContain('statuses=pending');
    expect(calledUrl).toContain('country=UG');
  });

  it('should parse Retry-After in RFC 7231 HTTP-Date format on 429 response', async () => {
    const futureDate = new Date(Date.now() + 2000).toUTCString();
    let callCount = 0;

    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 429,
          headers: new Headers({ 'retry-after': futureDate }),
          text: async () => JSON.stringify({ message: 'Rate limited' }),
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: 'success', data: { retried: true } }),
      };
    });

    const client = new HttpClient({
      apiKey: 'k',
      apiSecret: 's',
      maxRetries: 1,
      fetch: mockFetch as unknown as typeof fetch,
    });

    const res = await client.request('GET', '/test-rate-limit');
    expect(res.status).toBe('success');
    expect(callCount).toBe(2);
  });

  it('should throw MarzPayRateLimitError when maxRetries is 0 on 429', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'retry-after': '5' }),
      text: async () => JSON.stringify({ message: 'Rate limited' }),
    });

    const client = new HttpClient({
      apiKey: 'k',
      apiSecret: 's',
      maxRetries: 0,
      fetch: mockFetch as unknown as typeof fetch,
    });

    await expect(client.request('GET', '/test')).rejects.toThrow(MarzPayRateLimitError);
  });

  it('should retry 500 server errors up to maxRetries and throw MarzPayAPIError on exhaustion', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: false,
        status: 500,
        headers: new Headers(),
        text: async () => JSON.stringify({ message: 'Internal Server Error' }),
      };
    });

    const client = new HttpClient({
      apiKey: 'k',
      apiSecret: 's',
      maxRetries: 2,
      fetch: mockFetch as unknown as typeof fetch,
    });

    await expect(client.request('GET', '/server-error')).rejects.toThrow(MarzPayAPIError);
    expect(callCount).toBe(3); // 1 initial + 2 retries
  });

  it('should retry and map network timeouts to MarzPayNetworkError', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      throw error;
    });

    const client = new HttpClient({
      apiKey: 'k',
      apiSecret: 's',
      timeoutMs: 50,
      maxRetries: 1,
      fetch: mockFetch as unknown as typeof fetch,
    });

    await expect(client.request('GET', '/timeout')).rejects.toThrow(MarzPayNetworkError);
    expect(callCount).toBe(2);
  });

  it('should wrap raw response objects without status envelope into standard envelope', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ user_id: 123, active: true }),
    });

    const client = new HttpClient({
      apiKey: 'k',
      apiSecret: 's',
      fetch: mockFetch as unknown as typeof fetch,
    });

    const res = await client.request<{ user_id: number; active: boolean }>('GET', '/raw-profile');
    expect(res.status).toBe('success');
    expect((res.data as { user_id: number }).user_id).toBe(123);
  });

  it('should handle 401 and 403 as MarzPayAuthenticationError', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ message: 'Forbidden access' }),
    });

    const client = new HttpClient({
      apiKey: 'k',
      apiSecret: 's',
      maxRetries: 0,
      fetch: mockFetch as unknown as typeof fetch,
    });

    await expect(client.request('GET', '/restricted')).rejects.toThrow(MarzPayAuthenticationError);
  });
});
