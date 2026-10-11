export interface Logger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
}

export interface MarzPayConfig {
  /**
    MarzPay API Key from business dashboard.
    Defaults to process.env.MARZPAY_API_KEY.
   */
  apiKey?: string;

  /**
    MarzPay API Secret from business dashboard.
    Defaults to process.env.MARZPAY_API_SECRET.
   */
  apiSecret?: string;

  /**
    MarzPay API base endpoint URL.
    Defaults to process.env.MARZPAY_API_BASE or 'https://wallet.wearemarz.com/api/v1'.
   */
  baseUrl?: string;

  /**
    Optional webhook HMAC signing secret.
    Defaults to process.env.MARZPAY_WEBHOOK_SECRET.
   */
  webhookSecret?: string;

  /**
    Request timeout in milliseconds.
    Defaults to 30,000 (30 seconds).
   */
  timeoutMs?: number;

  /**
    Maximum number of retries for 429 and 5xx errors.
    Defaults to 3.
   */
  maxRetries?: number;

  /**
    Enable verbose console debug logging for requests, retries, and errors.
    Defaults to false.
   */
  debug?: boolean;

  /**
    Pluggable custom logger instance (compatible with console, winston, pino, etc.).
   */
  logger?: Logger;

  /**
    Custom fetch implementation.
    Defaults to global fetch.
   */
  fetch?: typeof fetch;
}

export const DEFAULT_BASE_URL = 'https://wallet.wearemarz.com/api/v1';
export const DEFAULT_TIMEOUT_MS = 30000;
export const DEFAULT_MAX_RETRIES = 3;
