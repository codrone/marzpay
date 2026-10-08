# Changelog

## 1.0.2

### Patch Changes

- 41a97d9: migrate ESLint configuration to flat
- 4820c12: omit dev dependencies in security audit and improve base URL trailing slash removal

All notable changes to the `marzpay` SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-08

### Added

- **Initial Open Source Release of official MarzPay TypeScript/JavaScript SDK**:
  - Full support for MarzPay REST API v1 (`https://wallet.wearemarz.com/api/v1`).
  - **Zero runtime dependencies** powered by modern Native `fetch` API and Web Crypto.
  - **Modular namespaced client API**:
    - `marzpay.collections`: Initiate mobile money & card payments across 12 African markets (`UG`, `KE`, `RW`, `CD`, `ZM`, `CM`, `BJ`, `CI`, `GA`, `CG`, `SN`, `SL`).
    - `marzpay.disbursements`: Send money payouts to mobile wallets with real-time balance deductions & fee estimates.
    - `marzpay.bankTransfers`: Account validation and bank payouts to supported financial institutions.
    - `marzpay.billPayments`: Utility verification and bill payments for electricity (LIGHT/UMEME), water (NWSC), and TV (DSTV/GOTV).
    - `marzpay.airtime`: Purchase airtime and data bundles for MTN, Airtel, and Lyca networks.
    - `marzpay.phoneVerification`: Subscriber KYC lookup and name verification.
    - `marzpay.balance`: Multi-currency wallet balance lookup (`UGX`, `KES`, `RWF`, `ZMW`, `XAF`, `XOF`, `SLE`, `CDF`, `USD`) and ledger history.
    - `marzpay.transactions`: Transaction status checks and lookup fallback.
    - `marzpay.paymentLinks`: CRUD operations for hosted payment links.
    - `marzpay.webhooks`: Dashboard webhook CRUD, HMAC signature verification (`marzpay.webhooks.verifySignature`), and unified event payload parsing (`marzpay.webhooks.parseEvent`) normalizing direct callbacks & dashboard wrappers into discriminated union types.
    - `marzpay.services`: Marketplace subscription status checks.
    - `marzpay.whatsapp`: WhatsApp channel integration endpoints.
    - `marzpay.ussd`: USSD channel integration endpoints.
  - **Custom Error Hierarchy**:
    - `MarzPayError`: Base error class.
    - `MarzPayAPIError`: Handles API 4xx/5xx responses with structured error codes.
    - `MarzPayAuthenticationError`: HTTP 401/403 authorization failures.
    - `MarzPayValidationError`: Request payload validation errors with field-level breakdowns.
    - `MarzPayNetworkError`: Network failures and connection timeouts.
  - Dual build artifacts for Node.js, ESM (`.mjs`), CommonJS (`.js`), and TypeScript types (`.d.ts`).
