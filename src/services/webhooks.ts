import { HttpClient } from '../utils/http';
import { verifyWebhookSignature } from '../utils/crypto';
import {
  APIResponseEnvelope,
  CreateWebhookConfigParams,
  DashboardWebhookWrapper,
  DirectCallbackEvent,
  ParsedWebhookEvent,
  UpdateWebhookConfigParams,
  WebhookConfigRecord,
} from '../types';

export class WebhooksService {
  constructor(
    private readonly http: HttpClient,
    private readonly defaultWebhookSecret?: string
  ) {}

  /**
    List registered dashboard webhooks.
   */
  public async list(): Promise<APIResponseEnvelope<{ webhooks: WebhookConfigRecord[] }>> {
    return this.http.request<{ webhooks: WebhookConfigRecord[] }>('GET', '/webhooks');
  }

  /**
    Register a new dashboard webhook endpoint.
   */
  public async create(
    params: CreateWebhookConfigParams
  ): Promise<APIResponseEnvelope<{ webhook: WebhookConfigRecord }>> {
    return this.http.request<{ webhook: WebhookConfigRecord }>('POST', '/webhooks', {
      body: params,
    });
  }

  /**
    Get webhook registration detail by UUID.
   */
  public async get(uuid: string): Promise<APIResponseEnvelope<{ webhook: WebhookConfigRecord }>> {
    return this.http.request<{ webhook: WebhookConfigRecord }>('GET', `/webhooks/${uuid}`);
  }

  /**
    Update existing webhook registration.
   */
  public async update(
    uuid: string,
    params: UpdateWebhookConfigParams
  ): Promise<APIResponseEnvelope<{ webhook: WebhookConfigRecord }>> {
    return this.http.request<{ webhook: WebhookConfigRecord }>('PUT', `/webhooks/${uuid}`, {
      body: params,
    });
  }

  /**
    Delete webhook registration.
   */
  public async delete(uuid: string): Promise<APIResponseEnvelope<{ message: string }>> {
    return this.http.request<{ message: string }>('DELETE', `/webhooks/${uuid}`);
  }

  /**
    Verify HMAC signature of an incoming webhook payload.
    
    @param rawBody Raw JSON request body string
    @param signatureHeader Value of 'x-marzpay-signature' (or 'x-signature') header
    @param secret Secret key for signing (defaults to config webhookSecret)
    @param timestampHeader Optional value of 'x-marzpay-timestamp' header
   */
  public async verifySignature(
    rawBody: string,
    signatureHeader: string | null | undefined,
    secret?: string,
    timestampHeader?: string | null,
    toleranceInSeconds: number = 300
  ): Promise<boolean> {
    const signingSecret = secret || this.defaultWebhookSecret;
    if (!signingSecret) {
      throw new Error(
        'Webhook secret is required to verify signature. Pass secret parameter or set MARZPAY_WEBHOOK_SECRET in configuration.'
      );
    }
    return verifyWebhookSignature(
      rawBody,
      signatureHeader,
      signingSecret,
      timestampHeader,
      toleranceInSeconds
    );
  }

  /**
    Parse and auto-normalize incoming webhook / callback payload.
    Handles both direct per-request callbacks and dashboard-wrapped webhooks into a strongly-typed event.
    
    @param payload Raw JSON string or parsed JSON object
   */
  public parseEvent(payload: string | Record<string, unknown>): ParsedWebhookEvent {
    let body: any = payload;
    if (typeof payload === 'string') {
      try {
        body = JSON.parse(payload);
      } catch (err) {
        throw new Error(`Invalid JSON webhook payload: ${(err as Error).message}`);
      }
    }

    if (!body || typeof body !== 'object') {
      throw new Error('Webhook payload must be a non-null JSON object');
    }

    // Check if wrapped in Dashboard Webhook envelope ({ event_type, webhook_id, data: { ... } })
    if (
      'webhook_id' in body &&
      'data' in body &&
      typeof body.data === 'object' &&
      body.data !== null
    ) {
      const wrapper = body as DashboardWebhookWrapper;
      const innerEvent = wrapper.data as DirectCallbackEvent;

      return {
        ...innerEvent,
        is_dashboard_wrapper: true,
        webhook_id: wrapper.webhook_id,
        business_id: wrapper.business_id,
      };
    }

    // Direct callback payload
    return {
      ...(body as DirectCallbackEvent),
      is_dashboard_wrapper: false,
    };
  }

  /**
    Construct and verify a webhook event from a raw body string and signature header.
    Validates HMAC signature and timestamp tolerance before returning the strongly-typed event.
    
    @param rawBody Raw JSON string body from request
    @param signatureHeader Value of 'x-marzpay-signature' (or 'x-signature') header
    @param secret Optional override secret key (defaults to config webhookSecret)
    @param toleranceInSeconds Max timestamp drift tolerance (default 300s / 5 minutes)
    
    @example
    ```typescript
    const event = await marzpay.webhooks.constructEvent(
      req.rawBody,
      req.headers['x-marzpay-signature']
    );
    console.log('Received verified webhook:', event.event_type);
    ```
   */
  public async constructEvent(
    rawBody: string,
    signatureHeader: string | null | undefined,
    secret?: string,
    toleranceInSeconds: number = 300
  ): Promise<ParsedWebhookEvent> {
    if (typeof rawBody !== 'string') {
      throw new Error(
        'Webhook payload must be a raw JSON string. If using Express, Next.js, or Fastify, ensure you pass unparsed body text.'
      );
    }
    const isValid = await this.verifySignature(
      rawBody,
      signatureHeader,
      secret,
      undefined,
      toleranceInSeconds
    );
    if (!isValid) {
      throw new Error('Invalid MarzPay webhook HMAC signature or stale timestamp');
    }
    return this.parseEvent(rawBody);
  }
}
