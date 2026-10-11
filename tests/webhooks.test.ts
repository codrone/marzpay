import { describe, expect, it } from 'vitest';
import { CollectionCompletedEvent, MarzPay, verifyWebhookSignature } from '../src';

describe('WebhooksService & HMAC Signature', () => {
  const secret = 'whsec_test_secret_key_12345';
  const rawBody = JSON.stringify({
    event_type: 'collection.completed',
    transaction: {
      uuid: 'tx-123',
      reference: 'ref-456',
      status: 'completed',
      amount: { formatted: '10,000.00', raw: 10000, currency: 'UGX' },
    },
    collection: {
      provider: 'mtn',
      provider_transaction_id: 'MTN123456',
    },
  });

  it('should verify valid HMAC signature', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadToSign = `${timestamp}.${rawBody}`;

    // Compute expected HMAC sha256 hex
    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');

    const isValid = await verifyWebhookSignature(rawBody, `t=${timestamp},v1=${signature}`, secret);

    expect(isValid).toBe(true);
  });

  it('should reject stale timestamp replay attacks', async () => {
    const staleTimestamp = '1700000000'; // Stale timestamp
    const payloadToSign = `${staleTimestamp}.${rawBody}`;

    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');

    const isValid = await verifyWebhookSignature(
      rawBody,
      `t=${staleTimestamp},v1=${signature}`,
      secret,
      undefined,
      300 // 5 minute max tolerance
    );

    expect(isValid).toBe(false);
  });

  it('should reject invalid HMAC signature', async () => {
    const isValid = await verifyWebhookSignature(
      rawBody,
      't=1700000000,v1=invalid_signature_hash',
      secret
    );

    expect(isValid).toBe(false);
  });

  it('should parse direct callback webhook payload correctly', () => {
    const client = new MarzPay({ webhookSecret: secret });

    const event = client.webhooks.parseEvent(rawBody);

    expect(event.event_type).toBe('collection.completed');
    expect(event.is_dashboard_wrapper).toBe(false);
    expect((event as CollectionCompletedEvent).collection.provider_transaction_id).toBe(
      'MTN123456'
    );
  });

  it('should parse dashboard-wrapped webhook payload correctly', () => {
    const client = new MarzPay({ webhookSecret: secret });

    const wrappedPayload = JSON.stringify({
      event_type: 'collection.completed',
      webhook_id: 88,
      business_id: 102,
      timestamp: '2026-08-20T15:18:48Z',
      data: JSON.parse(rawBody),
    });

    const event = client.webhooks.parseEvent(wrappedPayload);

    expect(event.event_type).toBe('collection.completed');
    expect(event.is_dashboard_wrapper).toBe(true);
    expect(event.webhook_id).toBe(88);
    expect((event as CollectionCompletedEvent).collection.provider_transaction_id).toBe(
      'MTN123456'
    );
  });

  it('should constructEvent successfully with valid signature', async () => {
    const client = new MarzPay({ webhookSecret: secret });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadToSign = `${timestamp}.${rawBody}`;

    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', secret).update(payloadToSign).digest('hex');

    const event = await client.webhooks.constructEvent(rawBody, `t=${timestamp},v1=${signature}`);

    expect(event.event_type).toBe('collection.completed');
  });

  it('should throw Error in constructEvent with invalid signature', async () => {
    const client = new MarzPay({ webhookSecret: secret });

    await expect(client.webhooks.constructEvent(rawBody, 'v1=bad_signature')).rejects.toThrow(
      'Invalid MarzPay webhook HMAC signature'
    );
  });
});
