import { describe, expect, it } from 'vitest';
import {
  MarzPayAPIError,
  MarzPayAuthenticationError,
  MarzPayError,
  MarzPayNetworkError,
  MarzPayValidationError,
} from '../src';

describe('MarzPay Error Classes', () => {
  it('should maintain correct prototype chain and inheritance', () => {
    const err = new MarzPayError('Base error');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(MarzPayError);
    expect(err.name).toBe('MarzPayError');

    const apiErr = new MarzPayAPIError('API error', 500, 'INTERNAL_ERROR');
    expect(apiErr).toBeInstanceOf(MarzPayError);
    expect(apiErr).toBeInstanceOf(MarzPayAPIError);
    expect(apiErr.statusCode).toBe(500);

    const authErr = new MarzPayAuthenticationError('Unauthorized');
    expect(authErr).toBeInstanceOf(MarzPayAPIError);
    expect(authErr).toBeInstanceOf(MarzPayAuthenticationError);
    expect(authErr.statusCode).toBe(401);

    const valErr = new MarzPayValidationError('Invalid inputs', 422, { phone: ['Invalid phone'] });
    expect(valErr).toBeInstanceOf(MarzPayValidationError);
    expect(valErr.errors?.phone).toContain('Invalid phone');

    const netErr = new MarzPayNetworkError('Connection timeout');
    expect(netErr).toBeInstanceOf(MarzPayError);
    expect(netErr).toBeInstanceOf(MarzPayNetworkError);
  });
});
