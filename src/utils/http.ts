import {
  MarzPayConfig,
  Logger,
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_RETRIES,
} from '../config';
import {
  MarzPayError,
  MarzPayAPIError,
  MarzPayAuthenticationError,
  MarzPayNetworkError,
  MarzPayValidationError,
  MarzPayRateLimitError,
} from '../errors';
import { APIResponseEnvelope } from '../types';
import { generateIdempotencyKey } from './crypto';

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;
  private readonly logger?: Logger;

  constructor(config: MarzPayConfig = {}) {
    const apiKey =
      config.apiKey || (typeof process !== 'undefined' ? process.env.MARZPAY_API_KEY : '');
    const apiSecret =
      config.apiSecret || (typeof process !== 'undefined' ? process.env.MARZPAY_API_SECRET : '');
    const baseUrl =
      config.baseUrl ||
      (typeof process !== 'undefined' ? process.env.MARZPAY_API_BASE : '') ||
      DEFAULT_BASE_URL;

    let cleanedBaseUrl = baseUrl;
    while (cleanedBaseUrl.endsWith('/')) {
      cleanedBaseUrl = cleanedBaseUrl.slice(0, -1);
    }
    this.baseUrl = cleanedBaseUrl;
    this.apiKey = apiKey || '';
    this.apiSecret = apiSecret || '';
    this.timeoutMs = config.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.fetchImpl = config.fetch || globalThis.fetch;
    this.logger = config.logger || (config.debug ? console : undefined);

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
    Send HTTP Request to MarzPay API with retries for rate limits and server errors
   */
  public async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options: {
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
      idempotencyKey?: string;
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

    const idempotencyKey =
      options.idempotencyKey ||
      options.headers?.['Idempotency-Key'] ||
      options.headers?.['idempotency-key'] ||
      options.headers?.['x-idempotency-key'];

    const headers: Record<string, string> = {
      Authorization: this.getAuthHeader(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    } else if ((method === 'POST' || method === 'PUT') && !headers['Idempotency-Key']) {
      // Auto-generate Idempotency-Key for mutating requests to guarantee retry safety
      headers['Idempotency-Key'] = generateIdempotencyKey();
    }

    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt <= this.maxRetries) {
      attempt++;
      this.logger?.debug(`[MarzPay] ${method} ${url} (attempt ${attempt}/${this.maxRetries + 1})`);
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

        // Handle 204 No Content
        if (response.status === 204) {
          this.logger?.debug(`[MarzPay] ${method} ${url} -> 204 No Content`);
          return {
            status: 'success',
            data: null as unknown as T,
          };
        }

        let responseText = '';
        try {
          responseText = await response.text();
        } catch (e) {
          throw new MarzPayNetworkError(
            'Failed to read response body from MarzPay API',
            e as Error
          );
        }

        let parsedData: any = {};
        if (responseText) {
          try {
            parsedData = JSON.parse(responseText);
          } catch {
            // Strip HTML tags if Cloudflare/Nginx proxy returned an error page
            const cleanText = responseText
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            parsedData = { message: cleanText || responseText };
          }
        }

        if (!response.ok) {
          const errorMessage =
            parsedData?.message || parsedData?.error || `HTTP ${response.status} Error`;

          // Parse Retry-After header if present
          let retryAfter: number | undefined;
          const retryHeader = response.headers?.get
            ? response.headers.get('retry-after')
            : undefined;
          if (retryHeader) {
            const seconds = parseInt(retryHeader, 10);
            if (!isNaN(seconds)) {
              retryAfter = seconds;
            }
          }

          if (response.status === 429) {
            const error = new MarzPayRateLimitError(
              errorMessage,
              response.status,
              retryAfter,
              parsedData
            );
            if (attempt <= this.maxRetries) {
              lastError = error;
              const backoffMs = retryAfter ? retryAfter * 1000 : Math.pow(2, attempt) * 500;
              this.logger?.warn(
                `[MarzPay] HTTP 429 Rate Limit. Retrying in ${backoffMs}ms... (attempt ${attempt}/${this.maxRetries})`
              );
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
              continue;
            }
            this.logger?.error(
              `[MarzPay] HTTP 429 Rate Limit Exceeded after ${this.maxRetries} retries.`
            );
            throw error;
          }

          if (response.status >= 500 && attempt <= this.maxRetries) {
            lastError = new MarzPayAPIError(
              errorMessage,
              response.status,
              parsedData?.error_code,
              parsedData?.errors,
              parsedData
            );
            const backoffMs = Math.pow(2, attempt) * 500;
            this.logger?.warn(
              `[MarzPay] Server Error ${response.status}. Retrying in ${backoffMs}ms... (attempt ${attempt}/${this.maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }

          this.logger?.error(`[MarzPay] API Error HTTP ${response.status}: ${errorMessage}`);

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
            parsedData,
            retryAfter
          );
        }

        this.logger?.debug(`[MarzPay] ${method} ${url} -> HTTP ${response.status} Success`);

        // Format response into envelope if raw object was returned
        if (
          parsedData &&
          typeof parsedData === 'object' &&
          !('status' in parsedData) &&
          !('data' in parsedData)
        ) {
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
          const timeoutErr = new MarzPayNetworkError(
            `MarzPay API request timed out after ${this.timeoutMs}ms`
          );
          if (attempt <= this.maxRetries) {
            lastError = timeoutErr;
            this.logger?.warn(
              `[MarzPay] Request timeout. Retrying attempt ${attempt}/${this.maxRetries}...`
            );
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 500));
            continue;
          }
          throw timeoutErr;
        }
        const netErr = new MarzPayNetworkError(
          error.message || 'Network error communicating with MarzPay',
          error
        );
        if (attempt <= this.maxRetries) {
          lastError = netErr;
          this.logger?.warn(
            `[MarzPay] Network error: ${error.message}. Retrying attempt ${attempt}/${this.maxRetries}...`
          );
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 500));
          continue;
        }
        throw netErr;
      }
    }

    throw lastError || new MarzPayNetworkError('MarzPay API request failed after maximum retries');
  }
}
