/**
 * Savrdh Financial Services Pvt. Ltd.
 * Customer Credit Resolution App
 */

import React, { useState } from "react";
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

const EMPTY_PROFILE: UserProfile = {
  fullName: "",
  mobile: "",
  email: "",
  isMobileVerified: false,
  isEmailVerified: false,
  biometricEnabled: false,
};

const EMPTY_KYC: KYCData = {
  aadhaarNumber: "",
  maskedAadhaar: "",
  panNumber: "",
  isVerified: false,
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>("SPLASH");
  const [userProfile, setUserProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [kycData, setKycData] = useState<KYCData>(EMPTY_KYC);

  // These values are placeholders only until the relevant step replaces them
  // with data returned by the production integration.
  const [creditReport, setCreditReport] = useState<CreditBureauReport>(DEFAULT_CREDIT_REPORT);
  const [aiAnalysis, setAiAnalysis] = useState<AICreditAnalysis>(INITIAL_AI_ANALYSIS);
  const [selectedPackage, setSelectedPackage] = useState<ResolutionPackage>(RESOLUTION_PACKAGES[1]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [crmLead, setCrmLead] = useState<CRMLeadRecord | null>(null);
  const [advisor, setAdvisor] = useState<AssignedAdvisor>(ASSIGNED_ADVISOR);

  const [activeReportModal, setActiveReportModal] = useState<"CREDIT_REPORT" | "INVOICE" | "RESOLUTION_REPORT" | "NDC_CERTIFICATE" | "LETTER_OF_AUTHORITY" | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const handleGetStarted = () => setCurrentStep("REGISTRATION");

  // Production must never manufacture a paid customer session. Until a real
  // persisted-session / WebAuthn flow is wired, quick unlock simply routes the
  // customer through normal authentication.
  const handleBiometricLogin = () => setCurrentStep("REGISTRATION");

  const handleRegistrationComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentStep("KYC");
  };

  const handleKycComplete = (kyc: KYCData) => {
    setKycData(kyc);
    if (kyc.fetchedProfile?.name) {
      setUserProfile((prev) => ({ ...prev, fullName: kyc.fetchedProfile!.name }));
    }
    setCurrentStep("CREDIT_REPORT");
  };

  const handleProceedToAnalysis = (report: CreditBureauReport) => {
    setCreditReport(report);
    setCurrentStep("CREDIT_ANALYSIS");
  };

  const handleProceedToPricing = (analysisData: AICreditAnalysis) => {
    setAiAnalysis(analysisData);
    setCurrentStep("PRICING");
  };

  const handleSelectPackage = (pkg: ResolutionPackage) => {
    setSelectedPackage(pkg);
    setCurrentStep("PAYMENT");
  };

  const handlePaymentSuccess = (pDetails: PaymentDetails) => {
    setPaymentDetails(pDetails);
    setCurrentStep("CRM_SYNC");
  };

  const handleLeadSynced = (lead: CRMLeadRecord, assignedAdv: AssignedAdvisor) => {
    setCrmLead(lead);
    setAdvisor(assignedAdv);
    setCurrentStep("DASHBOARD");
  };

  const handleResetFlow = () => {
    setCurrentStep("SPLASH");
    setUserProfile(EMPTY_PROFILE);
    setKycData(EMPTY_KYC);
    setPaymentDetails(null);
    setCrmLead(null);
  };

  return (
    <MobileContainer currentStep={currentStep} onResetFlow={handleResetFlow}>
      {currentStep !== "SPLASH" && currentStep !== "DASHBOARD" && (
        <FlowStepper currentStep={currentStep} />
      )}

      {currentStep === "SPLASH" && (
        <Step1SplashWelcome
          onGetStarted={handleGetStarted}
          onBiometricLogin={handleBiometricLogin}
        />
      )}

      {currentStep === "REGISTRATION" && (
        <Step2Registration
          initialProfile={userProfile}
          onComplete={handleRegistrationComplete}
        />
      )}

      {currentStep === "KYC" && (
        <Step3DigitalKYC
          userProfile={userProfile}
          initialKYC={kycData}
          onComplete={handleKycComplete}
        />
      )}

      {currentStep === "CREDIT_REPORT" && (
        <Step4CreditReport
          kycData={kycData}
          initialReport={creditReport}
          onProceedToAnalysis={handleProceedToAnalysis}
        />
      )}

      {currentStep === "CREDIT_ANALYSIS" && (
        <Step5CreditAnalysis
          creditReport={creditReport}
          userProfile={userProfile}
          initialAnalysis={aiAnalysis}
          onProceedToPricing={handleProceedToPricing}
        />
      )}

      {currentStep === "PRICING" && (
        <Step6Pricing
          analysis={aiAnalysis}
          selectedPackage={selectedPackage}
          onSelectPackage={handleSelectPackage}
        />
      )}

      {currentStep === "PAYMENT" && (
        <Step7Payment
          packageSelected={selectedPackage}
          userProfile={userProfile}
          onPaymentSuccess={handlePaymentSuccess}
          onViewInvoice={() => setActiveReportModal("INVOICE")}
          onViewConsent={() => setActiveReportModal("LETTER_OF_AUTHORITY")}
        />
      )}

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

      {currentStep === "DASHBOARD" && (!paymentDetails || !crmLead) && (
        <div className="p-8 text-center space-y-4">
          <p className="text-sm text-slate-300">Your customer session is not available.</p>
          <button
            onClick={handleResetFlow}
            className="py-2.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs"
          >
            Sign in again
          </button>
        </div>
      )}

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
