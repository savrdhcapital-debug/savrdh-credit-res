import { AICreditAnalysis, CRMLeadRecord, UserProfile, KYCData, CreditBureauReport, ResolutionPackage, LetterOfAuthorityConsent } from "../types";
import { INITIAL_AI_ANALYSIS } from "../data/mockData";

async function parseApiError(response: Response, fallback: string): Promise<Error> {
  try {
    const data = await response.json();
    return new Error(data?.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function executeLetterOfAuthorityApi(payload: {
  customerName: string;
  panNumber: string;
  aadhaarNumberMasked: string;
  address: string;
  mobile: string;
  email: string;
}): Promise<{ success: boolean; message: string; loa: LetterOfAuthorityConsent }> {
  const response = await fetch("/api/consent/execute-loa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseApiError(response, "Unable to execute Letter of Authority");
  return response.json();
}

export async function fetchAiCreditAnalysis(
  creditReport: CreditBureauReport,
  customerName: string
): Promise<AICreditAnalysis> {
  try {
    const response = await fetch("/api/credit/ai-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        creditData: {
          score: creditReport.score,
          activeLoans: creditReport.summary.activeLoansCount,
          creditCards: creditReport.summary.activeCreditCardsCount,
          settledAccounts: creditReport.summary.settledAccountsCount,
          writtenOffAccounts: creditReport.summary.writtenOffAccountsCount,
          defaultAmount: creditReport.summary.totalOverdue,
          enquiries: creditReport.summary.totalEnquiries,
          dpdInstances: `${creditReport.summary.dpdInstances} overdue flags`,
        },
      }),
    });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    return {
      summary: data.summary || INITIAL_AI_ANALYSIS.summary,
      totalIssuesIdentified: data.totalIssuesIdentified || 4,
      scoreImpactPoints: data.scoreImpactPoints || -185,
      estimatedRecoveryMonths: data.estimatedRecoveryMonths || "3 to 4 Months",
      projectedScore: data.projectedScore || 747,
      keyIssues: data.keyIssues || INITIAL_AI_ANALYSIS.keyIssues,
      recommendedPlan: data.recommendedPlan || INITIAL_AI_ANALYSIS.recommendedPlan,
      expertTakeaway: data.expertTakeaway || INITIAL_AI_ANALYSIS.expertTakeaway,
      isAiGenerated: data.isAiGenerated ?? true,
    };
  } catch (error) {
    console.warn("AI service unavailable; using diagnostic template:", error);
    return INITIAL_AI_ANALYSIS;
  }
}

export async function syncLeadToCrm(payload: {
  userProfile: UserProfile;
  kycData: KYCData;
  creditReport: CreditBureauReport;
  packageSelected: ResolutionPackage;
  paymentId: string;
  loaConsent?: LetterOfAuthorityConsent | null;
}): Promise<{ success: boolean; lead: CRMLeadRecord; message: string }> {
  const response = await fetch("/api/crm/create-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: payload.userProfile.fullName || payload.kycData.fetchedProfile?.name,
      mobile: payload.userProfile.mobile,
      email: payload.userProfile.email,
      aadhaarNumberMasked: payload.kycData.maskedAadhaar,
      panNumber: payload.kycData.panNumber,
      dob: payload.kycData.fetchedProfile?.dob,
      gender: payload.kycData.fetchedProfile?.gender,
      address: payload.kycData.fetchedProfile?.address,
      creditScore: payload.creditReport.score,
      creditBureau: payload.creditReport.bureauName,
      activeLoansCount: payload.creditReport.summary.activeLoansCount,
      creditCardsCount: payload.creditReport.summary.activeCreditCardsCount,
      settledAccountsCount: payload.creditReport.summary.settledAccountsCount,
      writtenOffAccountsCount: payload.creditReport.summary.writtenOffAccountsCount,
      totalDefaultAmount: payload.creditReport.summary.totalOverdue,
      resolutionPackage: payload.packageSelected.title,
      packageAmount: payload.packageSelected.price,
      paymentId: payload.paymentId,
      loaStatus: payload.loaConsent ? "EXECUTED_AND_VERIFIED" : undefined,
      loaReferenceNumber: payload.loaConsent?.referenceNumber,
      loaConsentTimestamp: payload.loaConsent?.consentTimestamp,
    }),
  });
  if (!response.ok) throw await parseApiError(response, "CRM lead could not be created");
  return response.json();
}

export async function askAdvisorSmartReply(
  userMessage: string,
  customerName: string,
  caseStage: string
): Promise<string> {
  try {
    const res = await fetch("/api/advisor/chat-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, customerName, caseStage }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.reply;
  } catch {
    return `Namaste ${customerName || "sir/madam"}, your message has been received. Our resolution team will review it and respond through your case record.`;
  }
}

export async function sendAuthOtp(payload: {
  mobile: string;
  email?: string;
  fullName?: string;
}): Promise<{
  success: boolean;
  message: string;
  isLiveSmsSent?: boolean;
  provider?: string;
  previewMobileOtp?: string;
  previewEmailOtp?: string;
}> {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseApiError(res, "Failed to dispatch OTP");
  return res.json();
}

export async function verifyAuthOtp(payload: {
  mobile: string;
  mobileOtp: string;
  emailOtp?: string;
}): Promise<{
  success: boolean;
  message: string;
  authToken?: string;
}> {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseApiError(res, "Invalid OTP entered");
  return res.json();
}

export async function getSmsConfigStatus(): Promise<{
  isConfigured: boolean;
  activeProvider: string;
  senderId: string;
  message: string;
}> {
  try {
    const res = await fetch("/api/auth/sms-config-status");
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      isConfigured: false,
      activeProvider: "Unavailable",
      senderId: "SAVRDH",
      message: "OTP service is currently unavailable",
    };
  }
}
