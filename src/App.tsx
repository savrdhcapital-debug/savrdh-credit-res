/**
 * Savrdh Financial Services Pvt. Ltd.
 * Customer Credit Resolution App
 */

import React, { useState, useEffect } from "react";
import {
  AppStep,
  UserProfile,
  KYCData,
  CreditBureauReport,
  AICreditAnalysis,
  ResolutionPackage,
  PaymentDetails,
  CRMLeadRecord,
  AssignedAdvisor
} from "./types";
import {
  DEFAULT_CREDIT_REPORT,
  INITIAL_AI_ANALYSIS,
  RESOLUTION_PACKAGES,
  ASSIGNED_ADVISOR
} from "./data/mockData";

import { MobileContainer } from "./components/common/MobileContainer";
import { FlowStepper } from "./components/common/FlowStepper";

import { Step1SplashWelcome } from "./components/steps/Step1SplashWelcome";
import { Step2Registration } from "./components/steps/Step2Registration";
import { Step3DigitalKYC } from "./components/steps/Step3DigitalKYC";
import { Step4CreditReport } from "./components/steps/Step4CreditReport";
import { Step5CreditAnalysis } from "./components/steps/Step5CreditAnalysis";
import { Step6Pricing } from "./components/steps/Step6Pricing";
import { Step7Payment } from "./components/steps/Step7Payment";
import { Step8LeadSyncing } from "./components/steps/Step8LeadSyncing";
import { CustomerDashboard } from "./components/dashboard/CustomerDashboard";

import { ReportViewerModal } from "./components/modals/ReportViewerModal";
import { SecuritySettingsModal } from "./components/modals/SecuritySettingsModal";

export default function App() {
  // App Step State
  const [currentStep, setCurrentStep] = useState<AppStep>("SPLASH");

  // User & KYC State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "Rajeshwar Sharma",
    mobile: "9820491823",
    email: "rajeshwar.sharma@example.com",
    isMobileVerified: false,
    isEmailVerified: false,
    biometricEnabled: true,
  });

  const [kycData, setKycData] = useState<KYCData>({
    aadhaarNumber: "582948199283",
    maskedAadhaar: "XXXX-XXXX-9283",
    panNumber: "ABCDE1234F",
    isVerified: false,
    fetchedProfile: {
      name: "Rajeshwar Sharma",
      dob: "14 Jun 1988",
      gender: "Male",
      fatherName: "Devendra Sharma",
      address: "Flat 402, B-Wing, Royal Palms Residency, Aarey Colony, Goregaon East, Mumbai, Maharashtra - 400065",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
  });

  // Credit Bureau & AI Diagnostic State
  const [creditReport, setCreditReport] = useState<CreditBureauReport>(DEFAULT_CREDIT_REPORT);
  const [aiAnalysis, setAiAnalysis] = useState<AICreditAnalysis>(INITIAL_AI_ANALYSIS);

  // Selected Resolution Package & Payment
  const [selectedPackage, setSelectedPackage] = useState<ResolutionPackage>(RESOLUTION_PACKAGES[1]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  // CRM Lead & Advisor
  const [crmLead, setCrmLead] = useState<CRMLeadRecord | null>(null);
  const [advisor, setAdvisor] = useState<AssignedAdvisor>(ASSIGNED_ADVISOR);

  // Modals
  const [activeReportModal, setActiveReportModal] = useState<"CREDIT_REPORT" | "INVOICE" | "RESOLUTION_REPORT" | "NDC_CERTIFICATE" | "LETTER_OF_AUTHORITY" | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Step 1 -> Step 2
  const handleGetStarted = () => {
    setCurrentStep("REGISTRATION");
  };

  // Biometric Fast Unlock (Fast demo pass into dashboard or registration)
  const handleBiometricLogin = () => {
    if (crmLead && paymentDetails) {
      setCurrentStep("DASHBOARD");
    } else {
      // Fast demo setup
      const verifiedProfile: UserProfile = {
        fullName: "Rajeshwar Sharma",
        mobile: "9820491823",
        email: "rajeshwar.sharma@example.com",
        isMobileVerified: true,
        isEmailVerified: true,
        authToken: `jwt_svr_bio_${Date.now()}`,
        biometricEnabled: true,
      };
      const verifiedKyc: KYCData = {
        aadhaarNumber: "582948199283",
        maskedAadhaar: "XXXX-XXXX-9283",
        panNumber: "ABCDE1234F",
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        kycProvider: "UIDAI Biometric Auth",
        fetchedProfile: kycData.fetchedProfile,
      };
      const pDetails: PaymentDetails = {
        paymentId: `PAY_SVR_DEMO_${Date.now()}`,
        orderId: `ORD_SVR_894102`,
        amount: selectedPackage.price,
        gstAmount: Math.round(selectedPackage.price * 0.18),
        totalAmount: selectedPackage.price + Math.round(selectedPackage.price * 0.18),
        paymentMethod: "UPI",
        paymentStatus: "SUCCESS",
        paidAt: new Date().toISOString(),
        invoiceNumber: "SAV-INV-2026-8941",
        selectedPackage: selectedPackage,
      };
      const mockLead: CRMLeadRecord = {
        leadId: "SAV-LEAD-894102",
        crmReferenceId: "CRM-SVR-894210",
        customerName: "Rajeshwar Sharma",
        mobile: "9820491823",
        email: "rajeshwar.sharma@example.com",
        aadhaarNumberMasked: "XXXX-XXXX-9283",
        panNumber: "ABCDE1234F",
        creditScore: 582,
        totalDefaultAmount: 485000,
        resolutionPackage: selectedPackage.title,
        packageAmount: selectedPackage.price,
        paymentId: pDetails.paymentId,
        paymentStatus: "PAID_SUCCESSFUL",
        paymentDate: new Date().toISOString(),
        caseStatus: "Under Legal Review",
        crmSyncStatus: "ROUTED_TO_ADVISOR",
        syncedAt: new Date().toISOString(),
      };

      setUserProfile(verifiedProfile);
      setKycData(verifiedKyc);
      setPaymentDetails(pDetails);
      setCrmLead(mockLead);
      setCurrentStep("DASHBOARD");
    }
  };

  // Step 2 Completed
  const handleRegistrationComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentStep("KYC");
  };

  // Step 3 Completed
  const handleKycComplete = (kyc: KYCData) => {
    setKycData(kyc);
    if (kyc.fetchedProfile?.name) {
      setUserProfile((prev) => ({ ...prev, fullName: kyc.fetchedProfile!.name }));
    }
    setCurrentStep("CREDIT_REPORT");
  };

  // Step 4 Completed
  const handleProceedToAnalysis = (report: CreditBureauReport) => {
    setCreditReport(report);
    setCurrentStep("CREDIT_ANALYSIS");
  };

  // Step 5 Completed
  const handleProceedToPricing = (analysisData: AICreditAnalysis) => {
    setAiAnalysis(analysisData);
    setCurrentStep("PRICING");
  };

  // Step 6 Completed
  const handleSelectPackage = (pkg: ResolutionPackage) => {
    setSelectedPackage(pkg);
    setCurrentStep("PAYMENT");
  };

  // Step 7 Completed
  const handlePaymentSuccess = (pDetails: PaymentDetails) => {
    setPaymentDetails(pDetails);
    setCurrentStep("CRM_SYNC");
  };

  // Step 8 & 9 Completed
  const handleLeadSynced = (lead: CRMLeadRecord, assignedAdv: AssignedAdvisor) => {
    setCrmLead(lead);
    setAdvisor(assignedAdv);
    setCurrentStep("DASHBOARD");
  };

  // Reset Flow
  const handleResetFlow = () => {
    setCurrentStep("SPLASH");
    setUserProfile((prev) => ({ ...prev, isMobileVerified: false, isEmailVerified: false }));
    setKycData((prev) => ({ ...prev, isVerified: false }));
    setPaymentDetails(null);
    setCrmLead(null);
  };

  return (
    <MobileContainer
      currentStep={currentStep}
      onResetFlow={handleResetFlow}
    >
      {/* Top Stepper for linear onboarding (Steps 2-7) */}
      {currentStep !== "SPLASH" && currentStep !== "DASHBOARD" && (
        <FlowStepper currentStep={currentStep} />
      )}

      {/* STEP 1: Splash & Welcome */}
      {currentStep === "SPLASH" && (
        <Step1SplashWelcome
          onGetStarted={handleGetStarted}
          onBiometricLogin={handleBiometricLogin}
        />
      )}

      {/* STEP 2: Registration & Dual OTP */}
      {currentStep === "REGISTRATION" && (
        <Step2Registration
          initialProfile={userProfile}
          onComplete={handleRegistrationComplete}
        />
      )}

      {/* STEP 3: Digital eKYC */}
      {currentStep === "KYC" && (
        <Step3DigitalKYC
          userProfile={userProfile}
          initialKYC={kycData}
          onComplete={handleKycComplete}
        />
      )}

      {/* STEP 4: Credit Report Fetch */}
      {currentStep === "CREDIT_REPORT" && (
        <Step4CreditReport
          kycData={kycData}
          initialReport={creditReport}
          onProceedToAnalysis={handleProceedToAnalysis}
        />
      )}

      {/* STEP 5: AI Credit Diagnostic */}
      {currentStep === "CREDIT_ANALYSIS" && (
        <Step5CreditAnalysis
          creditReport={creditReport}
          userProfile={userProfile}
          initialAnalysis={aiAnalysis}
          onProceedToPricing={handleProceedToPricing}
        />
      )}

      {/* STEP 6: Pricing */}
      {currentStep === "PRICING" && (
        <Step6Pricing
          analysis={aiAnalysis}
          selectedPackage={selectedPackage}
          onSelectPackage={handleSelectPackage}
        />
      )}

      {/* STEP 7: Payment */}
      {currentStep === "PAYMENT" && (
        <Step7Payment
          packageSelected={selectedPackage}
          userProfile={userProfile}
          onPaymentSuccess={handlePaymentSuccess}
          onViewInvoice={() => setActiveReportModal("INVOICE")}
          onViewConsent={() => setActiveReportModal("LETTER_OF_AUTHORITY")}
        />
      )}

      {/* STEP 8 & 9: Automatic CRM Sync & Advisor Assignment */}
      {currentStep === "CRM_SYNC" && paymentDetails && (
        <Step8LeadSyncing
          userProfile={userProfile}
          kycData={kycData}
          creditReport={creditReport}
          packageSelected={selectedPackage}
          paymentDetails={paymentDetails}
          onLeadSynced={handleLeadSynced}
          onViewLoa={() => setActiveReportModal("LETTER_OF_AUTHORITY")}
        />
      )}

      {/* STEPS 10-15: Customer Dashboard */}
      {currentStep === "DASHBOARD" && paymentDetails && crmLead && (
        <CustomerDashboard
          userProfile={userProfile}
          kycData={kycData}
          creditReport={creditReport}
          analysis={aiAnalysis}
          packageSelected={selectedPackage}
          paymentDetails={paymentDetails}
          crmLead={crmLead}
          advisor={advisor}
          onOpenReportModal={(type) => setActiveReportModal(type)}
          onOpenSecurityModal={() => setShowSecurityModal(true)}
          onLogout={handleResetFlow}
        />
      )}

      {/* Fallback if directly on DASHBOARD without payment details */}
      {currentStep === "DASHBOARD" && (!paymentDetails || !crmLead) && (
        <div className="p-8 text-center space-y-4">
          <p className="text-sm text-slate-300">Initializing session...</p>
          <button
            onClick={handleBiometricLogin}
            className="py-2.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs"
          >
            Load Customer Session
          </button>
        </div>
      )}

      {/* Full-Screen Report & Invoice Viewer Modal */}
      {activeReportModal && (
        <ReportViewerModal
          type={activeReportModal}
          userProfile={userProfile}
          kycData={kycData}
          creditReport={creditReport}
          paymentDetails={paymentDetails}
          crmLead={crmLead}
          onClose={() => setActiveReportModal(null)}
        />
      )}

      {/* Security & Authentication Settings Modal */}
      {showSecurityModal && (
        <SecuritySettingsModal
          userProfile={userProfile}
          onClose={() => setShowSecurityModal(false)}
          onUpdateProfile={(updated) => setUserProfile(updated)}
          onLogout={handleResetFlow}
        />
      )}
    </MobileContainer>
  );
}
