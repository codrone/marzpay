/**
  Base Error class for all MarzPay SDK errors
 */
export class MarzPayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MarzPayError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
  Error thrown when MarzPay API returns a 4xx or 5xx HTTP response
 */
export class MarzPayAPIError extends MarzPayError {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly errors?: Record<string, string[]>;
  public readonly rawResponse?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    errors?: Record<string, string[]>,
    rawResponse?: unknown
  ) {
    super(message);
    this.name = 'MarzPayAPIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.rawResponse = rawResponse;
  }
}

/**
  Error thrown when API credentials are missing or invalid (HTTP 401 / 403)
 */
export class MarzPayAuthenticationError extends MarzPayAPIError {
  constructor(message: string, statusCode = 401, rawResponse?: unknown) {
    super(message, statusCode, 'UNAUTHENTICATED', undefined, rawResponse);
    this.name = 'MarzPayAuthenticationError';
  }
}

/**
  Error thrown when request parameters fail validation (HTTP 400 / 422)
 */
export class MarzPayValidationError extends MarzPayAPIError {
  constructor(
    message: string,
    statusCode = 422,
    errors?: Record<string, string[]>,
    rawResponse?: unknown
  ) {
    super(message, statusCode, 'VALIDATION_ERROR', errors, rawResponse);
    this.name = 'MarzPayValidationError';
  }
}

/**
  Error thrown when network request fails or times out
 */
export class MarzPayNetworkError extends MarzPayError {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'MarzPayNetworkError';
    this.cause = cause;
  }
}
