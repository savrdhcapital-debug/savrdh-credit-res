export type IntegrationProvider =
  | "credit_bureau"
  | "gst"
  | "banking_data"
  | "kyc"
  | "whatsapp"
  | "esign"
  | "lender_api";

export interface IntegrationRequest<TPayload = unknown> {
  provider: IntegrationProvider;
  action: string;
  correlationId: string;
  entityType: string;
  entityId: string;
  payload: TPayload;
}

export interface IntegrationResponse<TData = unknown> {
  providerReference?: string;
  status: "queued" | "success" | "failed" | "manual_review";
  data?: TData;
  errorCode?: string;
  errorMessage?: string;
  receivedAt: string;
}

export interface IntegrationAdapter<TPayload = unknown, TData = unknown> {
  execute(
    request: IntegrationRequest<TPayload>
  ): Promise<IntegrationResponse<TData>>;
}

/**
 * Core platform modules depend only on this adapter boundary.
 * Vendor SDKs must remain in provider-specific packages so bureau, GST,
 * AA/banking, KYC, WhatsApp, eSign and lender APIs can be swapped without
 * redesigning business tables.
 */
