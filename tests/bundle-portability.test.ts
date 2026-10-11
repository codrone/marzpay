import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Bundle Portability & Dual-Package Exports (CJS + ESM)', () => {
  const cjsPath = resolve(__dirname, '../dist/index.js');
  const esmPath = resolve(__dirname, '../dist/index.mjs');
  const dtsPath = resolve(__dirname, '../dist/index.d.ts');
  const dmtsPath = resolve(__dirname, '../dist/index.d.mts');

  it('should ensure all build distribution artifacts exist', () => {
    expect(existsSync(cjsPath)).toBe(true);
    expect(existsSync(esmPath)).toBe(true);
    expect(existsSync(dtsPath)).toBe(true);
    expect(existsSync(dmtsPath)).toBe(true);
  });

  it('should load ESM bundle and expose all public exports and classes', async () => {
    const esmModule = await import(esmPath);

    expect(esmModule.MarzPay).toBeDefined();
    expect(typeof esmModule.MarzPay).toBe('function');
    expect(esmModule.MarzPayError).toBeDefined();
    expect(esmModule.MarzPayAPIError).toBeDefined();
    expect(esmModule.MarzPayRateLimitError).toBeDefined();
    expect(esmModule.MarzPayAuthenticationError).toBeDefined();
    expect(esmModule.MarzPayValidationError).toBeDefined();
    expect(esmModule.MarzPayNetworkError).toBeDefined();
    expect(typeof esmModule.sanitizePhoneNumber).toBe('function');
    expect(typeof esmModule.verifyWebhookSignature).toBe('function');

    // Instantiate client

    const client = new esmModule.MarzPay({ apiKey: 'k', apiSecret: 's' });
    expect(client.collections).toBeDefined();
    expect(client.disbursements).toBeDefined();
    expect(client.bankTransfers).toBeDefined();
    expect(client.billPayments).toBeDefined();
    expect(client.airtime).toBeDefined();
    expect(client.phoneVerification).toBeDefined();
    expect(client.balance).toBeDefined();
    expect(client.transactions).toBeDefined();
    expect(client.paymentLinks).toBeDefined();
    expect(client.services).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.whatsapp).toBeDefined();
    expect(client.ussd).toBeDefined();
  });

  it('should load CommonJS bundle and maintain class inheritance and behavior', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cjsModule = require(cjsPath);

    expect(cjsModule.MarzPay).toBeDefined();
    expect(typeof cjsModule.MarzPay).toBe('function');
    expect(cjsModule.MarzPayError).toBeDefined();
    expect(cjsModule.MarzPayAPIError).toBeDefined();
    expect(typeof cjsModule.sanitizePhoneNumber).toBe('function');
    expect(typeof cjsModule.verifyWebhookSignature).toBe('function');

    // Error prototype inheritance check in CJS
    const err = new cjsModule.MarzPayValidationError('Invalid', 422, { field: ['error'] });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(cjsModule.MarzPayError);
    expect(err).toBeInstanceOf(cjsModule.MarzPayAPIError);
    expect(err).toBeInstanceOf(cjsModule.MarzPayValidationError);
    expect(err.statusCode).toBe(422);

    // Instantiate client in CJS
    const client = new cjsModule.MarzPay({ apiKey: 'k', apiSecret: 's' });
    expect(client.collections).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.balance).toBeDefined();
  });
});
