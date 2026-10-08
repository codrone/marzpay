# MarzPay SDK for TypeScript & Node.js

[![CI](https://github.com/marzpay/marzpay-node-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/marzpay/marzpay-node-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/marzpay.svg)](https://www.npmjs.com/package/marzpay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)

The official, typesafe open-source JavaScript & TypeScript SDK for integrating **MarzPay API v1**. Easily collect payments (mobile money & cards), send disbursements, execute bank transfers, pay utility bills (Electricity, Water, TV), purchase airtime/data, verify subscriber identities, inspect balances, and handle webhooks across **12 African markets**.

---

## Supported Markets & Currencies

| Country | Code | Currency | Mobile Money Providers |
|---|---|---|---|
| **Uganda** | `UG` | `UGX` | MTN, Airtel |
| **Kenya** | `KE` | `KES` | M-Pesa |
| **Rwanda** | `RW` | `RWF` | MTN, Airtel |
| **DRC** | `CD` | `CDF` & `USD` | Vodacom, Airtel, Orange |
| **Zambia** | `ZM` | `ZMW` | MTN, Airtel, Zamtel |
| **Cameroon** | `CM` | `XAF` | MTN, Orange |
| **Benin** | `BJ` | `XOF` | MTN, Moov |
| **Côte d'Ivoire** | `CI` | `XOF` | MTN, Orange |
| **Gabon** | `GA` | `XAF` | Airtel |
| **Congo-Brazzaville** | `CG` | `XAF` | MTN, Airtel |
| **Senegal** | `SN` | `XOF` | Orange, Free |
| **Sierra Leone** | `SL` | `SLE` | Orange |

---

## Features

- **Zero Runtime Dependencies**: Uses native `fetch` and Web Crypto API. Compatible with Node.js 18+, Bun, Deno, Cloudflare Workers, Vercel Edge, and Browsers.
- **Full Type Safety**: Complete TypeScript definitions for requests, response envelopes, money objects, and webhook events.
- **Modular Namespaced API**: Intuitable autocomplete structure (`marzpay.collections.create()`, `marzpay.disbursements.send()`, `marzpay.balance.get()`, etc.).
- **Smart Webhooks & Security**: Built-in HMAC-SHA256 signature verification and payload normalization for both direct callbacks and dashboard-wrapped webhooks into discriminated unions.
- **Custom Error Hierarchy**: Easily handle HTTP authentication failures, payload validation errors, and network timeouts with typed exception classes.

---

## Installation

```bash
npm install marzpay
# or
yarn add marzpay
# or
pnpm add marzpay
# or
bun add marzpay
```

---

## Quick Start

```typescript
import { MarzPay } from 'marzpay';

const marzpay = new MarzPay({
  apiKey: process.env.MARZPAY_API_KEY,
  apiSecret: process.env.MARZPAY_API_SECRET,
  webhookSecret: process.env.MARZPAY_WEBHOOK_SECRET,
});

async function run() {
  // 1. Check wallet balance
  const balance = await marzpay.balance.get({ country: 'UG' });
  console.log('Available Balance:', balance.data.account.available_balance.formatted);

  // 2. Initiate Mobile Money Collection (e.g. Uganda)
  const collection = await marzpay.collections.create({
    amount: 5000,
    phone_number: '+256712345678',
    reference: 'c97fae8b-9b7f-4192-9f72-6f0859d33e67', // Unique UUID
    country: 'UG',
    description: 'Order #1042',
    callback_url: 'https://your-app.com/api/webhooks/marzpay',
  });

  console.log('Transaction Status:', collection.data.transaction.status);
}

run();
```

---

## Products & API Reference

### 1. Collections (Mobile Money & Card)

```typescript
// Mobile money collection (Uganda, Kenya M-Pesa, Rwanda, DRC, etc.)
const collection = await marzpay.collections.create({
  amount: 5000,
  phone_number: '+256712345678',
  reference: 'c97fae8b-9b7f-4192-9f72-6f0859d33e67',
  country: 'UG',
  description: 'Product Purchase',
});

// Card payment collection
const cardPayment = await marzpay.collections.create({
  amount: 15000,
  method: 'card',
  reference: 'b59d3d6d-5827-41ee-b455-18dd20ef1c8a',
  country: 'UG',
});
// Redirect customer to: cardPayment.data.redirect_url
```

### 2. Disbursements (Send Money)

```typescript
const payout = await marzpay.disbursements.send({
  amount: 10000,
  phone_number: '+256712345678',
  reference: 'payout-2026-07-31-001',
  country: 'UG',
  description: 'Vendor Payout',
});
```

### 3. Bank Transfers

```typescript
// 1. Validate bank account first
const validation = await marzpay.bankTransfers.validate({
  bank_name: 'Equity Bank',
  account_number: '60001256421',
});

// 2. Execute bank transfer
const transfer = await marzpay.bankTransfers.create({
  amount: 100000,
  bank_name: 'Equity Bank',
  bank_account_number: '60001256421',
  bank_account_name: 'John Doe',
  bank_branch: 'Kampala',
  description: 'Payment for services',
});
```

### 4. Utility Bill Payments

```typescript
// Verify electricity meter (LIGHT)
const verify = await marzpay.billPayments.verify({
  utility_code: 'LIGHT',
  meter_number: '12345678901',
});

// Pay utility bill
const bill = await marzpay.billPayments.pay({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  utility_code: 'LIGHT',
  meter_number: '12345678901',
  phone_number: '+256700000000',
  amount: 10000,
});
```

### 5. Airtime & Data Bundles

```typescript
// Purchase airtime
const airtime = await marzpay.airtime.purchase({
  reference: '550e8400-e29b-41d4-a716-446655440000',
  purchase_type: 'airtime',
  msisdn: '256771234567',
  amount: 5000,
});

// Purchase data bundle
const bundle = await marzpay.airtime.purchase({
  reference: '660e8400-e29b-41d4-a716-446655440001',
  purchase_type: 'bundle',
  msisdn: '256771234567',
  bundle_id: 'RACT_UG_Data_201',
});
```

### 6. Phone Verification (KYC)

```typescript
const subscriber = await marzpay.phoneVerification.verify({
  phone_number: '256712345678',
});

console.log('Subscriber Name:', subscriber.data.full_name);
```

### 7. Multi-Currency Wallet Balance

```typescript
// Read DRC USD wallet balance
const drcUsdBalance = await marzpay.balance.get({
  country: 'CD',
  currency: 'USD',
});

// Read ledger history
const history = await marzpay.balance.getHistory({
  country: 'UG',
  operation: 'collection',
});
```

---

## Webhook Handling & HMAC Signature Verification

### Express Example

```typescript
import express from 'express';
import { MarzPay } from 'marzpay';

const app = express();
const marzpay = new MarzPay();

// Note: Requires raw body string for HMAC calculation
app.post('/webhooks/marzpay', express.text({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-marzpay-signature'] as string;
  const timestamp = req.headers['x-marzpay-timestamp'] as string;

  // 1. Verify HMAC Signature
  const isValid = await marzpay.webhooks.verifySignature(req.body, signature, undefined, timestamp);
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // 2. Parse & normalize event (handles direct callbacks & dashboard wrappers)
  const event = marzpay.webhooks.parseEvent(req.body);

  switch (event.event_type) {
    case 'collection.completed':
      console.log('Payment received! Reference:', event.transaction.reference);
      console.log('Provider TX ID:', event.collection.provider_transaction_id);
      break;
    case 'disbursement.completed':
      console.log('Payout successful! Merchant Ref:', event.transaction.provider_reference);
      break;
    case 'collection.failed':
      console.log('Payment failed! Reference:', event.transaction.reference);
      break;
  }

  res.status(200).json({ received: true });
});
```

### Next.js App Router Example (`app/api/webhooks/marzpay/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { MarzPay } from 'marzpay';

const marzpay = new MarzPay();

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-marzpay-signature');
  const timestamp = req.headers.get('x-marzpay-timestamp');

  const isValid = await marzpay.webhooks.verifySignature(rawBody, signature, undefined, timestamp);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
  }

  const event = marzpay.webhooks.parseEvent(rawBody);

  if (event.event_type === 'collection.completed') {
    // Fulfill customer order
  }

  return NextResponse.json({ success: true });
}
```

---

## Error Handling

All SDK errors inherit from `MarzPayError`.

```typescript
import {
  MarzPay,
  MarzPayAPIError,
  MarzPayAuthenticationError,
  MarzPayValidationError,
  MarzPayNetworkError,
} from 'marzpay';

try {
  await marzpay.collections.create({ ... });
} catch (error) {
  if (error instanceof MarzPayValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof MarzPayAuthenticationError) {
    console.error('Check API credentials:', error.message);
  } else if (error instanceof MarzPayAPIError) {
    console.error('API Error:', error.statusCode, error.errorCode, error.message);
  } else if (error instanceof MarzPayNetworkError) {
    console.error('Network timeout or connection failure:', error.message);
  }
}
```

---

## Development & Testing

```bash
# Install dev dependencies
npm install

# Run TypeScript type check
npm run typecheck

# Run Vitest unit tests
npm test

# Build dual ESM/CJS bundles
npm run build

# Generate HTML documentation
npm run docs
```

---

## Contact & Support

For SDK inquiries, feedback, or direct support, please email [mpalaronald@gmail.com](mailto:mpalaronald@gmail.com).

---

## License

This SDK is open-source software licensed under the [MIT License](LICENSE).
