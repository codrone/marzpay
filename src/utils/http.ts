import { MarzPayConfig, DEFAULT_BASE_URL, DEFAULT_TIMEOUT_MS } from '../config';
import {
  MarzPayError,
  MarzPayAPIError,
  MarzPayAuthenticationError,
  MarzPayNetworkError,
  MarzPayValidationError,
} from '../errors';
import { APIResponseEnvelope } from '../types';

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: MarzPayConfig = {}) {
    const apiKey = config.apiKey || (typeof process !== 'undefined' ? process.env.MARZPAY_API_KEY : '');
    const apiSecret = config.apiSecret || (typeof process !== 'undefined' ? process.env.MARZPAY_API_SECRET : '');
    const baseUrl =
      config.baseUrl ||
      (typeof process !== 'undefined' ? process.env.MARZPAY_API_BASE : '') ||
      DEFAULT_BASE_URL;

    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey || '';
    this.apiSecret = apiSecret || '';
    this.timeoutMs = config.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.fetchImpl = config.fetch || globalThis.fetch;

    if (typeof this.fetchImpl !== 'function') {
      throw new Error(
        'Global fetch is not available in this environment. Please provide a custom fetch implementation in MarzPayConfig.'
      );
    }
  }

  /**
    Build Basic Auth Header string
   */
  private getAuthHeader(): string {
    const credentials = `${this.apiKey}:${this.apiSecret}`;
    if (typeof btoa === 'function') {
      return `Basic ${btoa(credentials)}`;
    }
    if (typeof Buffer !== 'undefined') {
      return `Basic ${Buffer.from(credentials).toString('base64')}`;
    }
    throw new Error('Unable to encode Basic authentication header in this environment');
  }

  /**
    Send HTTP Request to MarzPay API
   */
  public async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: {
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponseEnvelope<T>> {
    let url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    if (options.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      Authorization: this.getAuthHeader(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
        throw new MarzPayNetworkError('Failed to read response body from MarzPay API', e as Error);
      }

      let parsedData: any = {};
      if (responseText) {
        try {
          parsedData = JSON.parse(responseText);
        } catch {
          parsedData = { message: responseText };
        }
      }

      if (!response.ok) {
        const errorMessage =
          parsedData?.message || parsedData?.error || `HTTP ${response.status} Error`;

        if (response.status === 401 || response.status === 403) {
          throw new MarzPayAuthenticationError(errorMessage, response.status, parsedData);
        }

        if (response.status === 400 || response.status === 422) {
          throw new MarzPayValidationError(
            errorMessage,
            response.status,
            parsedData?.errors,
            parsedData
          );
        }

        throw new MarzPayAPIError(
          errorMessage,
          response.status,
          parsedData?.error_code,
          parsedData?.errors,
          parsedData
        );
      }

      // Format response into envelope if raw object was returned
      if (parsedData && typeof parsedData === 'object' && !('status' in parsedData) && !('data' in parsedData)) {
        return {
          status: 'success',
          data: parsedData as T,
        };
      }

      return parsedData as APIResponseEnvelope<T>;
    } catch (error: any) {
      clearTimeout(timer);
      if (error instanceof MarzPayError) {
        throw error;
      }
      if (error.name === 'AbortError') {
        throw new MarzPayNetworkError(`MarzPay API request timed out after ${this.timeoutMs}ms`);
      }
      throw new MarzPayNetworkError(error.message || 'Network error communicating with MarzPay', error);
    }
  }
}
