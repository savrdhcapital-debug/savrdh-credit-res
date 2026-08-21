/**
 * Savrdh Financial Services Pvt. Ltd.
 * Customer Credit Resolution App - Data Types & Interfaces
 */

export type AppStep =
  | "SPLASH"
  | "REGISTRATION"
  | "KYC"
  | "CREDIT_REPORT"
  | "CREDIT_ANALYSIS"
  | "PRICING"
  | "PAYMENT"
  | "CRM_SYNC"
  | "DASHBOARD";

export interface UserProfile {
  fullName: string;
  mobile: string;
  email: string;
  isMobileVerified: boolean;
  isEmailVerified: boolean;
  authToken?: string;
  biometricEnabled?: boolean;
}

export interface KYCData {
  aadhaarNumber: string;
  maskedAadhaar: string;
  panNumber: string;
  isVerified: boolean;
  verifiedAt?: string;
  kycProvider?: string;
  kycMethod?: "DOCUMENT_UPLOAD" | "UIDAI_OTP";
  referenceId?: string;
  panDocUrl?: string;
  panDocName?: string;
  aadhaarFrontDocUrl?: string;
  aadhaarFrontDocName?: string;
  aadhaarBackDocUrl?: string;
  aadhaarBackDocName?: string;
  fetchedProfile?: {
    name: string;
    dob: string;
    gender: string;
    address: string;
    photoUrl: string;
    fatherName?: string;
  };
}

export interface CreditAccountItem {
  id: string;
  institution: string;
  accountType:
    | "Personal Loan"
    | "Credit Card"
    | "Auto Loan"
    | "Home Loan"
    | "Consumer Durable"
    | "Two-wheeler Loan"
    | "Gold Loan"
    | "Priority Sector - Gold Loan"
    | "Kisan Credit Card"
    | "Secured Credit Card"
    | "Consumer Loan"
    | "Business Loan – General"
    | "Loan Against Bank Deposits"
    | string;
  accountNumberMasked: string;
  sanctionedAmount: number;
  currentBalance: number;
  overdueAmount: number;
  status: "Active" | "Settled" | "Written-Off" | "Closed" | "Defaulted" | "Overdue" | string;
  openedDate: string;
  closedDate?: string;
  lastPaymentDate?: string;
  lastReportedDate: string;
  dpdHistory: {
    month: string;
    year: string;
    dpd: "000" | "030" | "060" | "090" | "120+" | "LSS" | "SET" | "STD" | "DBT" | "SMA" | "SUB" | "XXX" | string;
  }[];
}

export interface CreditBureauReport {
  bureauName: "TransUnion CIBIL" | "Experian" | "Equifax" | "CRIF High Mark" | string;
  score: number;
  scoreBand: "Poor" | "Fair" | "Good" | "Excellent";
  reportDate: string;
  controlNumber: string;
  uploadedFileName?: string;
  rawFileDataUrl?: string;
  originalReportSource?: "FILE_UPLOAD" | "LIVE_BUREAU_API" | "EXPERIAN_PULL" | "CIBIL_PULL" | "EQUIFAX_PULL" | "CRIF_PULL" | string;
  verifiedProfile?: {
    matchedName: string;
    matchedDob?: string;
    matchedPan: string;
    matchedGender?: string;
    matchedAddress?: string;
    isNameVerified: boolean;
    isDobVerified: boolean;
    isPanVerified: boolean;
    verificationScore: number;
    verificationNotes?: string;
  };
  summary: {
    activeLoansCount: number;
    activeCreditCardsCount: number;
    totalOutstanding: number;
    totalOverdue: number;
    settledAccountsCount: number;
    writtenOffAccountsCount: number;
    totalEnquiries: number;
    creditUtilizationPercent: number;
    dpdInstances: number;
  };
  accounts: CreditAccountItem[];
  enquiries: {
    lender: string;
    amount: number;
    date: string;
    purpose: string;
  }[];
}

export interface CreditIssue {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  actionPlan: string;
  affectedInstitution?: string;
}

export interface AICreditAnalysis {
  summary: string;
  totalIssuesIdentified: number;
  scoreImpactPoints: number;
  estimatedRecoveryMonths: string;
  projectedScore: number;
  keyIssues: CreditIssue[];
  recommendedPlan: string;
  expertTakeaway?: string;
  isAiGenerated?: boolean;
}

export interface ResolutionPackage {
  id: string;
  title: string;
  badge?: string;
  price: number;
  originalPrice: number;
  duration: string;
  features: string[];
  recommendedFor: string;
  isPopular?: boolean;
}

export interface PaymentDetails {
  paymentId: string;
  orderId: string;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING" | "RAZORPAY_LIVE_GATEWAY" | "RAZORPAY_SANDBOX" | "RAZORPAY_GATEWAY" | string;
  paymentStatus: "SUCCESS" | "PENDING" | "FAILED";
  paidAt: string;
  invoiceNumber: string;
  selectedPackage: ResolutionPackage;
}

export interface LetterOfAuthorityConsent {
  isConsentGiven: boolean;
  grantorName: string;
  grantorPan: string;
  grantorAadhaarMasked: string;
  grantorAddress: string;
  authorizedEntity: string;
  cin: string;
  assignedAdvocateName: string;
  advocateBarNumber: string;
  scopeOfAuthority: string[];
  referenceNumber: string;
  consentTimestamp: string;
  digitalSignatureHash: string;
  ipAddress?: string;
}

export interface CRMLeadRecord {
  leadId: string;
  crmReferenceId: string;
  customerName: string;
  mobile: string;
  email: string;
  aadhaarNumberMasked: string;
  panNumber: string;
  creditScore: number;
  totalDefaultAmount: number;
  resolutionPackage: string;
  packageAmount: number;
  paymentId: string;
  paymentStatus: string;
  paymentDate: string;
  caseStatus: string;
  crmSyncStatus: "SYNCED" | "ROUTED_TO_ADVISOR";
  syncedAt: string;
  loaStatus?: "EXECUTED_AND_VERIFIED" | "PENDING_EXECUTION";
  loaReferenceNumber?: string;
  loaConsentTimestamp?: string;
}

export interface AssignedAdvisor {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  photo: string;
  barCouncilNumber?: string;
  experienceYears: number;
  casesResolved: number;
  rating: number;
}

export type CaseStageId =
  | "APP_RECEIVED"
  | "UNDER_REVIEW"
  | "LEGAL_REVIEW"
  | "BANK_COMM"
  | "NEGOTIATION"
  | "SETTLEMENT"
  | "CIBIL_UPDATE"
  | "COMPLETED";

export interface CaseMilestone {
  id: CaseStageId;
  title: string;
  subtitle: string;
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
  completedDate?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: "customer" | "advisor" | "system";
  text: string;
  mediaType?: "text" | "image" | "pdf";
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  timestamp: string;
  isRead: boolean;
}

export interface UploadedDoc {
  id: string;
  category: "LETTER_OF_AUTHORITY" | "TAX_INVOICE" | "PAN" | "BANK_STATEMENT" | "LOAN_STATEMENT" | "SETTLEMENT_LETTER" | "RECOVERY_NOTICE" | "COURT_NOTICE" | "OTHER";
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: "VERIFIED" | "UNDER_REVIEW" | "ACTION_REQUIRED";
  downloadUrl?: string;
  notes?: string;
}

export interface CompanyInfo {
  name: string;
  businessType: string;
  website: string;
  email: string;
  supportEmail: string;
  customerCare: string;
  corporateOffice: string;
  cin: string;
  services: string[];
  workingHours: string;
  portals: {
    customerPortal: string;
    advisorPortal: string;
    adminCrm: string;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "REGISTRATION" | "KYC" | "CREDIT_REPORT" | "PAYMENT" | "ADVISOR" | "CASE_UPDATE" | "DOC_REQUIRED" | "COMPLETED";
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "LEGAL_DIRECTOR" | "CASE_MANAGER";
  token: string;
}

export interface AdminLeadNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface AdminLeadTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "SYSTEM" | "LEGAL" | "PAYMENT" | "DOC" | "COMMUNICATION";
}

export interface AdminLeadDetail extends CRMLeadRecord {
  dob?: string;
  gender?: string;
  address?: string;
  fatherName?: string;
  panDocUrl?: string;
  panDocName?: string;
  aadhaarFrontDocUrl?: string;
  aadhaarFrontDocName?: string;
  aadhaarBackDocUrl?: string;
  aadhaarBackDocName?: string;
  cibilPdfUrl?: string;
  cibilPdfName?: string;
  creditBureau?: string;
  scoreBand?: string;
  activeLoansCount?: number;
  creditCardsCount?: number;
  settledAccountsCount?: number;
  writtenOffAccountsCount?: number;
  creditUtilizationPercent?: number;
  dpdInstances?: number;
  cibilAccounts?: CreditAccountItem[];
  cibilFee?: {
    isPaid: boolean;
    amount: number;
    paymentId?: string;
    invoiceNumber?: string;
    paidAt?: string;
  };
  resolutionFee?: {
    isPaid: boolean;
    packageName: string;
    amount: number;
    paymentId?: string;
    invoiceNumber?: string;
    paidAt?: string;
  };
  loaSignatureHash?: string;
  assignedAdvisor?: AssignedAdvisor;
  notes?: AdminLeadNote[];
  timeline?: AdminLeadTimelineEvent[];
}

export interface AdminStats {
  totalLeads: number;
  cibilProcuredCount: number;
  planSubscribedCount: number;
  totalRevenueCollected: number;
  totalDefaultUnderResolution: number;
  activeDisputesCount: number;
  statusCounts: { [key: string]: number };
}

export interface LoanTransaction {
  date: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  type: "EMI" | "BOUNCE_CHARGE" | "PENAL_INTEREST" | "FORECLOSURE" | "DISBURSAL" | "REGULAR";
  isFlaggedAsViolation?: boolean;
  violationReason?: string;
}

export interface LoanStatementAnalysis {
  id: string;
  lenderName: string;
  loanAccountNumber: string;
  loanType: string;
  borrowerName: string;
  sanctionedAmount: number;
  disbursalDate: string;
  tenorMonths: number;
  interestRatePerAnnum: number;
  interestType: "Fixed" | "Floating";
  emiAmount: number;
  emisPaidCount: number;
  emisPendingCount: number;
  principalPaid: number;
  interestPaid: number;
  currentPrincipalOutstanding: number;
  foreclosureChargesApplicable: number;
  foreclosureAmountPayoff: number;
  totalBounceCount: number;
  totalBounceChargesBilled: number;
  totalPenalInterestBilled: number;
  illegalPenalChargesDetected: number;
  rbiViolationFlags: string[];
  repaymentTrackScore: number; // 0 - 100%
  executiveSummary: string;
  recommendationPlan: string;
  transactions: LoanTransaction[];
}

