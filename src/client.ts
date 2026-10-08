import { MarzPayConfig } from './config';
import { HttpClient } from './utils/http';
import {
  AirtimeService,
  BalanceService,
  BankTransfersService,
  BillPaymentsService,
  CollectionsService,
  DisbursementsService,
  PaymentLinksService,
  PhoneVerificationService,
  ServicesService,
  TransactionsService,
  USSDService,
  WebhooksService,
  WhatsAppService,
} from './services';

/**
  Official MarzPay API v1 SDK Client
  
  @example
  ```typescript
  import { MarzPay } from 'marzpay';

  const marzpay = new MarzPay({
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    webhookSecret: 'whsec_...',
  });

  // Initiate a mobile money collection
  const res = await marzpay.collections.create({
    amount: 5000,
    phone_number: '+256712345678',
    reference: 'c97fae8b-9b7f-4192-9f72-6f0859d33e67',
    country: 'UG',
  });
  ```
 */
export class MarzPay {
  private readonly http: HttpClient;

  /** Mobile money & card collections service */
  public readonly collections: CollectionsService;
  /** Send money payouts & disbursements service */
  public readonly disbursements: DisbursementsService;
  /** Bank account payouts & validation service */
  public readonly bankTransfers: BankTransfersService;
  /** Electricity, Water, and TV utility bill payments service */
  public readonly billPayments: BillPaymentsService;
  /** Airtime & data bundle top-up service */
  public readonly airtime: AirtimeService;
  /** Subscriber identity lookup & KYC verification service */
  public readonly phoneVerification: PhoneVerificationService;
  /** Multi-currency wallet balance & ledger history service */
  public readonly balance: BalanceService;
  /** Transaction status & historical query service */
  public readonly transactions: TransactionsService;
  /** Hosted payment links management service */
  public readonly paymentLinks: PaymentLinksService;
  /** Service marketplace subscriptions service */
  public readonly services: ServicesService;
  /** Webhook registrations, HMAC verification & payload parsing service */
  public readonly webhooks: WebhooksService;
  /** WhatsApp channel integration service */
  public readonly whatsapp: WhatsAppService;
  /** USSD gateway integration service */
  public readonly ussd: USSDService;

  constructor(config: MarzPayConfig = {}) {
    this.http = new HttpClient(config);

    const webhookSecret =
      config.webhookSecret ||
      (typeof process !== 'undefined' ? process.env.MARZPAY_WEBHOOK_SECRET : undefined);

    this.collections = new CollectionsService(this.http);
    this.disbursements = new DisbursementsService(this.http);
    this.bankTransfers = new BankTransfersService(this.http);
    this.billPayments = new BillPaymentsService(this.http);
    this.airtime = new AirtimeService(this.http);
    this.phoneVerification = new PhoneVerificationService(this.http);
    this.balance = new BalanceService(this.http);
    this.transactions = new TransactionsService(this.http);
    this.paymentLinks = new PaymentLinksService(this.http);
    this.services = new ServicesService(this.http);
    this.webhooks = new WebhooksService(this.http, webhookSecret);
    this.whatsapp = new WhatsAppService(this.http);
    this.ussd = new USSDService(this.http);
  }
}
