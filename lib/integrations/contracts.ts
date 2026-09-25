export type ExternalRequestContext={correlationId:string;customerId?:string;applicationId?:string;idempotencyKey:string};
export interface KycProvider{verifyIdentity(input:unknown,ctx:ExternalRequestContext):Promise<unknown>}
export interface CreditBureauProvider{pullReport(input:unknown,ctx:ExternalRequestContext):Promise<unknown>}
export interface GstProvider{fetchTaxProfile(input:unknown,ctx:ExternalRequestContext):Promise<unknown>}
export interface BankingDataProvider{fetchBankingSummary(input:unknown,ctx:ExternalRequestContext):Promise<unknown>}
export interface MessagingProvider{sendTemplate(input:unknown,ctx:ExternalRequestContext):Promise<unknown>}
export interface ESignProvider{createEnvelope(input:unknown,ctx:ExternalRequestContext):Promise<unknown>}
export interface LenderProvider{submitApplication(input:unknown,ctx:ExternalRequestContext):Promise<unknown>;getApplicationStatus(input:unknown,ctx:ExternalRequestContext):Promise<unknown>}
export type IntegrationRegistry={kyc?:KycProvider;creditBureau?:CreditBureauProvider;gst?:GstProvider;banking?:BankingDataProvider;messaging?:MessagingProvider;esign?:ESignProvider;lender?:LenderProvider}; export const createIntegrationRegistry=():IntegrationRegistry=>({});