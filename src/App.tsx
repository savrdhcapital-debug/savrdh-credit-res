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

import { AdminCRMApp } from "./components/admin/AdminCRMApp";
import { AdminLoginModal } from "./components/admin/AdminLoginModal";
import { AdminLoginPage } from "./components/admin/AdminLoginPage";
import { AdminUser } from "./types";
import { ShieldCheck } from "lucide-react";

export default function App() {
  // App Step State
  const [currentStep, setCurrentStep] = useState<AppStep>("SPLASH");

  // Admin CRM State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    return (
      search.includes("admin") ||
      search.includes("page=admin") ||
      hash.includes("admin") ||
      pathname.includes("admin")
    );
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem("SAVRDH_ADMIN_USER");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Listen to popstate / hashchange to support direct URL navigation to /?page=admin or #admin
  useEffect(() => {
    const handleUrlChange = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      if (
        search.includes("admin") ||
        search.includes("page=admin") ||
        hash.includes("admin") ||
        pathname.includes("admin")
      ) {
        setIsAdminMode(true);
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  // User & KYC State (Clean initial state for real customer onboarding)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "",
    mobile: "",
    email: "",
    isMobileVerified: false,
    isEmailVerified: false,
    biometricEnabled: false,
  });

  const [kycData, setKycData] = useState<KYCData>({
    aadhaarNumber: "",
    maskedAadhaar: "",
    panNumber: "",
    isVerified: false,
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

  // Biometric Fast Unlock (Unlocks existing session or proceeds to registration)
  const handleBiometricLogin = () => {
    if (crmLead && paymentDetails) {
      setCurrentStep("DASHBOARD");
    } else if (userProfile.fullName && userProfile.isMobileVerified) {
      setCurrentStep("KYC");
    } else {
      setCurrentStep("REGISTRATION");
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
    setUserProfile({
      fullName: "",
      mobile: "",
      email: "",
      isMobileVerified: false,
      isEmailVerified: false,
      biometricEnabled: false,
    });
    setKycData({
      aadhaarNumber: "",
      maskedAadhaar: "",
      panNumber: "",
      isVerified: false,
    });
    setPaymentDetails(null);
    setCrmLead(null);
  };

  // If Admin Mode is active:
  if (isAdminMode) {
    if (adminUser) {
      return (
        <AdminCRMApp
          adminUser={adminUser}
          onLogout={() => {
            localStorage.removeItem("SAVRDH_ADMIN_TOKEN");
            localStorage.removeItem("SAVRDH_ADMIN_USER");
            setAdminUser(null);
            setIsAdminMode(false);
          }}
          onSwitchToCustomerApp={() => {
            setIsAdminMode(false);
          }}
        />
      );
    } else {
      return (
        <AdminLoginPage
          onLoginSuccess={(admin) => {
            setAdminUser(admin);
            setIsAdminMode(true);
          }}
          onReturnToCustomerApp={() => {
            setIsAdminMode(false);
          }}
        />
      );
    }
  }

  return (
    <MobileContainer
      currentStep={currentStep}
      onResetFlow={handleResetFlow}
      onOpenAdminCRM={() => setIsAdminMode(true)}
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
          onOpenAdminCRM={() => setIsAdminMode(true)}
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
          userProfile={userProfile}
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
          onOpenAdminCRM={() => setIsAdminMode(true)}
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

      {/* Floating Admin CRM Portal Access Button (Top Right / Bottom Floating) */}
      <div className="fixed bottom-3 right-3 z-40">
        <button
          onClick={() => {
            if (adminUser) {
              setIsAdminMode(true);
            } else {
              setIsAdminLoginOpen(true);
            }
          }}
          className="py-2 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-navy-950 font-bold text-xs shadow-xl shadow-black/60 flex items-center gap-2 border border-amber-300/40 transition-all transform hover:scale-105 active:scale-95"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Staff Admin CRM</span>
        </button>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(admin) => {
          setAdminUser(admin);
          setIsAdminMode(true);
        }}
      />
    </MobileContainer>
  );
}

