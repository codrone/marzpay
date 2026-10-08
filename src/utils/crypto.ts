/**
  Verify MarzPay HMAC-SHA256 signature for incoming webhooks.
  
  @param rawBody Raw JSON request body string
  @param signatureHeader Value of 'x-marzpay-signature' (or 'x-signature') header e.g. "t=1700000000,v1=abc123def..."
  @param secret Secret key used for signing (e.g. process.env.MARZPAY_WEBHOOK_SECRET)
  @param timestampHeader Optional value of 'x-marzpay-timestamp' header if separate
  @returns Boolean indicating signature validity
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
  timestampHeader?: string | null
): Promise<boolean> {
  if (!signatureHeader || !secret) {
    return false;
  }

  let timestamp = timestampHeader || '';
  let v1Hash = '';

  // Parse header if in format "t=1700000000,v1=abcdef..."
  if (signatureHeader.includes('v1=')) {
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 't' && value && !timestamp) {
        timestamp = value;
      } else if (key === 'v1' && value) {
        v1Hash = value;
      }
    }
  } else {
    v1Hash = signatureHeader.trim();
  }

  if (!v1Hash) {
    return false;
  }

  const payloadToSign = timestamp ? `${timestamp}.${rawBody}` : rawBody;

  try {
    const computedHash = await computeHmacSha256Hex(payloadToSign, secret);
    return timingSafeEqual(computedHash.toLowerCase(), v1Hash.toLowerCase());
  } catch {
    return false;
  }
}

async function computeHmacSha256Hex(data: string, secret: string): Promise<string> {
  // Web Crypto API (Node 18+, Bun, Deno, Browsers, Workers)
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await globalThis.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await globalThis.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(data)
    );
    return Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Node.js fallback if Web Crypto is unavailable
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  } catch {
    throw new Error('No crypto implementation available for HMAC calculation');
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
