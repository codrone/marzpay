import { describe, expect, it } from 'vitest';
import { generateIdempotencyKey } from '../src/utils/crypto';
import { verifyWebhookSignature } from '../src';

describe('Crypto & Webhook Verification Edge Cases', () => {
  const secret = 'whsec_test_secret_key_abcdef';
  const rawBody = JSON.stringify({ event: 'test', id: '123' });

  it('should verify signature with raw string body', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = `${timestamp}.${rawBody}`;
    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const valid = await verifyWebhookSignature(rawBody, `t=${timestamp},v1=${signature}`, secret);
    expect(valid).toBe(true);
  });

  it('should verify signature with Uint8Array body', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = `${timestamp}.${rawBody}`;
    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const buffer = new TextEncoder().encode(rawBody);
    const valid = await verifyWebhookSignature(buffer, `t=${timestamp},v1=${signature}`, secret);
    expect(valid).toBe(true);
  });

  it('should verify signature with multiple signatures during secret rotation', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = `${timestamp}.${rawBody}`;
    const crypto = await import('crypto');
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const oldSignature = 'old_stale_rotated_signature_hash_0123456789abcdef';

    // Rotation header with multiple v1 hashes
    const header = `t=${timestamp},v1=${oldSignature},v1=${validSignature}`;
    const valid = await verifyWebhookSignature(rawBody, header, secret);
    expect(valid).toBe(true);
  });

  it('should handle millisecond timestamps (13 digits) seamlessly', async () => {
    const nowMs = Date.now().toString(); // 13 digits
    const payload = `${nowMs}.${rawBody}`;
    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const valid = await verifyWebhookSignature(rawBody, `t=${nowMs},v1=${signature}`, secret);
    expect(valid).toBe(true);
  });

  it('should reject invalid non-numeric timestamp strings when tolerance is active', async () => {
    const invalidTimestamp = 'not-a-number';
    const payload = `${invalidTimestamp}.${rawBody}`;
    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const valid = await verifyWebhookSignature(
      rawBody,
      `t=${invalidTimestamp},v1=${signature}`,
      secret
    );
    expect(valid).toBe(false);
  });

  it('should be case-insensitive to uppercase hex signatures', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = `${timestamp}.${rawBody}`;
    const crypto = await import('crypto');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
      .toUpperCase();

    const valid = await verifyWebhookSignature(rawBody, `t=${timestamp},v1=${signature}`, secret);
    expect(valid).toBe(true);
  });

  it('should reject missing or empty signature header or secret', async () => {
    expect(await verifyWebhookSignature(rawBody, '', secret)).toBe(false);
    expect(await verifyWebhookSignature(rawBody, null, secret)).toBe(false);
    expect(await verifyWebhookSignature(rawBody, undefined, secret)).toBe(false);
    expect(await verifyWebhookSignature(rawBody, 'v1=abc', '')).toBe(false);
  });

  it('should verify signature without timestamp when signature is raw hex', async () => {
    const crypto = await import('crypto');
    const rawSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const valid = await verifyWebhookSignature(rawBody, rawSignature, secret);
    expect(valid).toBe(true);
  });

  it('should generate valid UUID or prefixed idempotency keys', () => {
    const key1 = generateIdempotencyKey();
    const key2 = generateIdempotencyKey();

    expect(key1).toBeTruthy();
    expect(key2).toBeTruthy();
    expect(key1).not.toBe(key2);
  });
});
