import React, { useState, useEffect } from "react";
import {
  Mail,
  X,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  ShieldCheck,
  ExternalLink,
  Info,
  Check,
  AlertTriangle,
  Key,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Globe,
  Radio,
  Zap,
  Layers,
} from "lucide-react";
import { fetchEmailStatusApi, fetchEmailLogsApi, sendTestEmailApi, saveEmailConfigApi } from "../../services/api";

interface EmailMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HostingPreset {
  id: string;
  name: string;
  host: string;
  port: string;
  secure: boolean;
  description: string;
  passwordHint: string;
}

const HOSTING_PRESETS: HostingPreset[] = [
  {
    id: "hostinger",
    name: "Hostinger Email (Active)",
    host: "smtp.hostinger.com",
    port: "465",
    secure: true,
    description: "Hostinger Mail Server (Outgoing SMTP: smtp.hostinger.com:465 SSL | Incoming IMAP: imap.hostinger.com:993 SSL)",
    passwordHint: "Enter your Hostinger Email password for support@savrdhfinancialservices.com",
  },
  {
    id: "cpanel",
    name: "cPanel / Direct Webmail",
    host: "mail.savrdhfinancialservices.com",
    port: "465",
    secure: true,
    description: "cPanel Webmail server for savrdhfinancialservices.com",
    passwordHint: "Enter your standard cPanel / Webmail mailbox password",
  },
  {
    id: "titan",
    name: "Titan Email",
    host: "smtp.titan.email",
    port: "465",
    secure: true,
    description: "Titan Professional Mail for domains",
    passwordHint: "Enter your Titan Webmail password",
  },
  {
    id: "godaddy",
    name: "GoDaddy Webmail",
    host: "smtpout.secureserver.net",
    port: "465",
    secure: true,
    description: "GoDaddy Workspace Email Server",
    passwordHint: "Enter your GoDaddy email password",
  },
  {
    id: "zoho",
    name: "Zoho Workplace Mail",
    host: "smtppro.zoho.in",
    port: "465",
    secure: true,
    description: "Zoho Mail India / Global SMTP Server",
    passwordHint: "Enter your Zoho Mail password / App Password",
  },
  {
    id: "gmail",
    name: "Google Workspace / Gmail",
    host: "smtp.gmail.com",
    port: "587",
    secure: false,
    description: "Google Workspace for Custom Domains",
    passwordHint: "Enter your 16-character Google App Password",
  },
  {
    id: "custom",
    name: "Custom SMTP Server",
    host: "",
    port: "465",
    secure: true,
    description: "Custom mail hosting or private relay",
    passwordHint: "Enter your SMTP server password",
  },
];

export const EmailMonitoringModal: React.FC<EmailMonitoringModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"logs" | "connect" | "guide" | "template">("connect");
  const [previewVariant, setPreviewVariant] = useState<"package" | "otp" | "cibil" | "welcome">("package");
  const [statusData, setStatusData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Hosting Preset (Defaulted to Hostinger from Screenshot)
  const [selectedPresetId, setSelectedPresetId] = useState<string>("hostinger");

  // Test Email state
  const [testEmailTarget, setTestEmailTarget] = useState("savrdhcapital@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    simulated?: boolean;
    error?: string;
  } | null>(null);

  // SMTP Configuration form state
  const [smtpHost, setSmtpHost] = useState("smtp.hostinger.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("support@savrdhfinancialservices.com");
  const [smtpPass, setSmtpPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isTestingBeforeSave, setIsTestingBeforeSave] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const loadEmailData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        fetchEmailStatusApi(),
        fetchEmailLogsApi(),
      ]);
      if (statusRes.success) {
        setStatusData(statusRes);
        if (statusRes.smtpHost) {
          setSmtpHost(statusRes.smtpHost);
          // Match preset
          const matched = HOSTING_PRESETS.find((p) => p.host === statusRes.smtpHost);
          if (matched) setSelectedPresetId(matched.id);
        }
        if (statusRes.smtpPort) setSmtpPort(String(statusRes.smtpPort));
        if (statusRes.smtpUser) setSmtpUser(statusRes.smtpUser);
        if (statusRes.adminEmails && statusRes.adminEmails[0]) {
          setTestEmailTarget(statusRes.adminEmails[0]);
        }
        if (statusRes.isConfigured) {
          // If already configured, template or logs can be viewed
        } else {
          setActiveTab("connect");
        }
      }
      if (logsRes.success && logsRes.logs) {
        setLogs(logsRes.logs);
      }
    } catch (err) {
      console.error("Error loading email diagnostics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmailData();
      setTestResult(null);
      setSaveResult(null);
    }
  }, [isOpen]);

  const handleSelectPreset = (preset: HostingPreset) => {
    setSelectedPresetId(preset.id);
    if (preset.id !== "custom") {
      setSmtpHost(preset.host);
      setSmtpPort(preset.port);
    }
    setSaveResult(null);
  };

  const handleSendTestEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testEmailTarget || !testEmailTarget.includes("@")) return;

    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestEmailApi({
        targetEmail: testEmailTarget.trim(),
        customPass: smtpPass ? smtpPass.trim() : undefined,
        customUser: smtpUser.trim(),
        customHost: smtpHost.trim(),
        customPort: smtpPort.trim(),
      });
      setTestResult(res);
      // Reload logs
      loadEmailData();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Failed to dispatch test email",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpPass.trim()) {
      setSaveResult({
        success: false,
        message: "Please enter the password for support@savrdhfinancialservices.com",
      });
      return;
    }

    setIsSavingConfig(true);
    setSaveResult(null);
    try {
      const res = await saveEmailConfigApi({
        host: smtpHost.trim(),
        port: smtpPort.trim(),
        user: smtpUser.trim(),
        pass: smtpPass.trim(),
        fromEmail: "support@savrdhfinancialservices.com",
        fromName: "Savrdh Financial Services",
      });
      setSaveResult(res);
      if (res.success) {
        loadEmailData();
      }
    } catch (err: any) {
      setSaveResult({
        success: false,
        message: err?.message || "Failed to update SMTP configuration",
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  if (!isOpen) return null;

  const isLiveConfigured = statusData?.isConfigured;
  const currentPreset = HOSTING_PRESETS.find((p) => p.id === selectedPresetId) || HOSTING_PRESETS[0];

  return (
    <div
      id="email-diagnostics-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Official Mail Server Engine</h2>
                {isLiveConfigured ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE HOSTING SMTP CONNECTED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    READY TO CONNECT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Official Mailbox: <strong className="text-amber-300 font-mono">support@savrdhfinancialservices.com</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadEmailData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh logs & connection status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("template")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "template"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Email Template Preview</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              MATCHED
            </span>
          </button>
          <button
            onClick={() => setActiveTab("connect")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "connect"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Hosting Mail Server & Connector</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "logs"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live Audit Logs ({logs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "guide"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hosting Mail Setup Guide</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 0: TEMPLATE PREVIEW MATCHING USER SCREENSHOT */}
          {activeTab === "template" && (
            <div className="space-y-4">
              {/* Template Variant Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Savrdh Corporate Email Template</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    All outgoing emails (OTP, Invoices, LOA, KYC, CIBIL) are formatted using this exact layout.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                  <button
                    onClick={() => setPreviewVariant("package")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      previewVariant === "package"
                        ? "bg-amber-500 text-slate-950 shadow font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Invoice & LOA
                  </button>
                  <button
                    onClick={() => setPreviewVariant("otp")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      previewVariant === "otp"
                        ? "bg-amber-500 text-slate-950 shadow font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    OTP Email
                  </button>
                  <button
                    onClick={() => setPreviewVariant("cibil")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      previewVariant === "cibil"
                        ? "bg-amber-500 text-slate-950 shadow font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ₹350 CIBIL Receipt
                  </button>
                  <button
                    onClick={() => setPreviewVariant("welcome")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      previewVariant === "welcome"
                        ? "bg-amber-500 text-slate-950 shadow font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Welcome Email
                  </button>
                </div>
              </div>

              {/* LIVE EMAIL MOCKUP CONTAINER */}
              <div className="rounded-2xl border border-slate-700 bg-slate-100 text-slate-900 shadow-2xl overflow-hidden max-w-[650px] mx-auto font-sans">
                {/* 1. TOP CORPORATE HEADER */}
                <div className="bg-[#0B1528] text-white p-5 border-b-4 border-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0B1528] font-black text-2xl shadow-lg shadow-amber-500/30 shrink-0">
                      ⬡
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold tracking-wider text-white leading-tight font-serif">
                        SAVRDH
                      </div>
                      <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                        FINANCIAL SERVICES PVT. LTD.
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5 sm:text-right font-medium">
                    <div>
                      <span className="text-amber-400 mr-1.5">✉</span>
                      <span>support@savrdhfinancialservices.com</span>
                    </div>
                    <div>
                      <span className="text-amber-400 mr-1.5">📞</span>
                      <span>+91 81099 95906</span>
                    </div>
                    <div>
                      <span className="text-amber-400 mr-1.5">🌐</span>
                      <span>www.savrdhfinancialservices.com</span>
                    </div>
                  </div>
                </div>

                {/* 2. BODY SECTION */}
                <div className="p-6 bg-white space-y-5">
                  {/* Hero Greeting & Verified Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        {previewVariant === "package" && (
                          <>Congratulations, <span className="text-amber-600">balramsingh</span>!</>
                        )}
                        {previewVariant === "otp" && (
                          <>Namaste, <span className="text-amber-600">balramsingh</span>!</>
                        )}
                        {previewVariant === "cibil" && (
                          <>Payment Confirmed, <span className="text-amber-600">balramsingh</span>!</>
                        )}
                        {previewVariant === "welcome" && (
                          <>Welcome, <span className="text-amber-600">balramsingh</span>!</>
                        )}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {previewVariant === "package" && (
                          <>Your credit resolution case has been successfully registered under <strong>Comprehensive Debt Settlement & CIBIL Correction</strong>.</>
                        )}
                        {previewVariant === "otp" && (
                          <>Your 4-digit verification code to authenticate your Savrdh Credit Resolution portal is ready.</>
                        )}
                        {previewVariant === "cibil" && (
                          <>We have received your payment of ₹350.00 for the <strong>Official Credit Bureau Report & Deep Diagnostic Audit</strong>.</>
                        )}
                        {previewVariant === "welcome" && (
                          <>Your client profile on <strong>Savrdh Financial Services</strong> is now active. We are set to assist you with credit dispute handling.</>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {previewVariant === "package" && "We are now officially working on your case."}
                        {previewVariant === "otp" && "Please enter this OTP on your screen to complete authentication."}
                        {previewVariant === "cibil" && "Your credit bureau report is now available in your portal."}
                        {previewVariant === "welcome" && "Your dedicated legal desk and underwriter panel have been initialized."}
                      </p>
                    </div>

                    {/* Vector Badge Icon */}
                    <div className="w-18 h-22 bg-slate-50 border-2 border-slate-200 rounded-xl p-2 flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <div className="w-8 h-1.5 bg-[#0B1528] rounded-full mb-2"></div>
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow">
                        ✓
                      </div>
                      <span className="text-[9px] font-black text-emerald-800 tracking-wider mt-1.5">VERIFIED</span>
                    </div>
                  </div>

                  {/* LOA / Verification Callout Box */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
                      🛡️
                    </div>
                    <div className="text-xs text-slate-700 space-y-0.5">
                      <div className="font-extrabold text-emerald-900 tracking-wider uppercase text-[11px]">
                        {previewVariant === "package" && "LETTER OF AUTHORITY (LOA) EXECUTED"}
                        {previewVariant === "otp" && "SECURITY AUTHENTICATION IN PROGRESS"}
                        {previewVariant === "cibil" && "CREDIT BUREAU REPORT READY"}
                        {previewVariant === "welcome" && "CUSTOMER ONBOARDING COMPLETED"}
                      </div>
                      <div className="text-slate-900 font-semibold text-[11px]">
                        Reference No: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">SAV-LOA-2026-23210</strong>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        Savrdh Financial Services & Adv. Vikram Malhotra are now formally authorized to represent you before CIBIL and your lending banks.
                      </p>
                    </div>
                  </div>

                  {/* OTP Code Box if OTP variant */}
                  {previewVariant === "otp" && (
                    <div className="bg-[#0B1528] text-white p-5 rounded-2xl border-2 border-dashed border-amber-400 text-center space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                        YOUR 4-DIGIT VERIFICATION CODE
                      </div>
                      <div className="text-4xl font-mono font-black text-amber-400 tracking-[12px]">
                        4829
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        ✓ Valid for 10 minutes for single authentication
                      </div>
                    </div>
                  )}

                  {/* Two-Column Section: Summary Table + Stay Updated Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    {/* Left: Summary Table */}
                    <div className="sm:col-span-7 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 tracking-wider">
                        <span className="text-amber-500 font-black text-sm">|</span>
                        <span>
                          {previewVariant === "package" && "INVOICE SUMMARY"}
                          {previewVariant === "otp" && "LOGIN SECURITY DETAILS"}
                          {previewVariant === "cibil" && "TAX RECEIPT SUMMARY"}
                          {previewVariant === "welcome" && "ACCOUNT CREDENTIALS"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs divide-y divide-slate-100 shadow-sm">
                        {previewVariant === "package" ? (
                          <>
                            <div className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center text-[10px]">📄</span>
                                <span className="font-medium">Tax Invoice Number</span>
                              </div>
                              <span className="font-mono font-bold text-slate-900">SAV-INV-35460</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center text-[10px]">🏷️</span>
                                <span className="font-medium">Subscribed Plan</span>
                              </div>
                              <span className="font-semibold text-slate-900 text-right text-[11px]">Comprehensive Debt Settlement</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center text-[10px]">₹</span>
                                <span className="font-medium">Total Fee (Incl. 18% GST)</span>
                              </div>
                              <span className="font-black text-emerald-600 text-sm">₹9,999</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center text-[10px]">👤</span>
                                <span className="font-medium">Assigned Legal Counsel</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-amber-600">Adv. Vikram Malhotra</div>
                                <div className="text-[10px] text-slate-500">(+91 81099 95906)</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center text-[10px]">👤</span>
                                <span className="font-medium">Customer Name</span>
                              </div>
                              <span className="font-bold text-slate-900">balramsingh</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center text-[10px]">📱</span>
                                <span className="font-medium">Mobile Number</span>
                              </div>
                              <span className="font-mono font-bold text-slate-900">+91 98765 43210</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5">
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center text-[10px]">✉️</span>
                                <span className="font-medium">Recipient Mailbox</span>
                              </div>
                              <span className="font-medium text-slate-700 text-[11px]">customer@gmail.com</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Stay Updated Card */}
                    <div className="sm:col-span-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-amber-900 font-extrabold tracking-wider">
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">
                          i
                        </div>
                        <span>STAY UPDATED</span>
                      </div>
                      <p className="text-[11px] text-amber-950 leading-relaxed">
                        You can track your case milestones, view notices, and chat with your legal counsel anytime inside the Savrdh Customer Portal.
                      </p>
                      <div className="font-bold text-amber-900 text-[11px]">
                        — Team Savrdh
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <div className="text-center pt-2 space-y-1.5">
                    <button
                      type="button"
                      className="bg-[#0B1528] hover:bg-[#132240] text-white font-extrabold text-xs px-8 py-3.5 rounded-xl border border-amber-500 shadow-xl shadow-slate-900/20 inline-flex items-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
                    >
                      <span>💻</span>
                      <span>ACCESS YOUR CASE PORTAL</span>
                      <span>→</span>
                    </button>
                    <div className="text-[11px] text-slate-500">
                      Login with your registered mobile number to continue.
                    </div>
                  </div>
                </div>

                {/* 3. TRUST PILLARS BAR */}
                <div className="bg-[#0B1528] text-white p-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="space-y-1 p-1">
                    <div className="text-base">🔒</div>
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">SECURE & CONFIDENTIAL</div>
                    <div className="text-[9px] text-slate-400 leading-tight">Bank-grade 256-bit encryption</div>
                  </div>
                  <div className="space-y-1 p-1 sm:border-l sm:border-slate-800">
                    <div className="text-base">⚖️</div>
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">LEGAL EXPERTS</div>
                    <div className="text-[9px] text-slate-400 leading-tight">Advocates fighting for your rights</div>
                  </div>
                  <div className="space-y-1 p-1 sm:border-l sm:border-slate-800">
                    <div className="text-base">📈</div>
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">PROVEN RESULTS</div>
                    <div className="text-[9px] text-slate-400 leading-tight">Settlements across 1000+ cases</div>
                  </div>
                  <div className="space-y-1 p-1 sm:border-l sm:border-slate-800">
                    <div className="text-base">🎧</div>
                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">CUSTOMER FIRST</div>
                    <div className="text-[9px] text-slate-400 leading-tight">Dedicated support at every step</div>
                  </div>
                </div>

                {/* 4. FOOTER */}
                <div className="bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-200">
                  <div>
                    <div className="font-extrabold text-slate-900 tracking-wider">SAVRDH</div>
                    <div className="text-[9px] font-bold text-amber-600 uppercase">FINANCIAL SERVICES PVT. LTD.</div>
                  </div>
                  <div className="text-[11px] text-slate-600 text-center sm:text-left flex items-center gap-1">
                    <span className="text-amber-500 font-bold">📍</span>
                    <span>01, Gaur Yamuna City, Greater Noida, Uttar Pradesh - 201301</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Follow us:</span>
                    <span className="text-sm">🌐 💼 📷</span>
                  </div>
                </div>

                {/* Bottom Disclaimer Strip */}
                <div className="bg-[#070D18] text-slate-400 text-center py-2 px-4 text-[10px]">
                  This is an automated email. Please do not reply to this email.
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SMTP CONNECTOR WITH HOSTING PRESETS */}
          {activeTab === "connect" && (
            <div className="space-y-5">
              {/* Active Hostinger Settings Info Badge */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Hostinger Mail Services Configured</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        SSL 465 ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">
                      IMAP: <strong className="text-amber-300">imap.hostinger.com:993</strong> | SMTP: <strong className="text-amber-300">smtp.hostinger.com:465</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>TLS/SSL Enabled</span>
                </div>
              </div>

              {/* Preset Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select Your Mail Hosting Provider:</span>
                  </label>
                  <span className="text-[11px] text-amber-300/80">Click to apply standard settings</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {HOSTING_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10"
                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-bold truncate">{preset.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono truncate">
                          {preset.host || "Custom host"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SMTP Settings Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>{currentPreset.name} Configuration</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentPreset.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      SSL/TLS Port: {smtpPort}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveSmtpConfig} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Outgoing User */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Outgoing Mailbox (Username / Email) *
                      </label>
                      <input
                        type="text"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400 font-semibold"
                        placeholder="support@savrdhfinancialservices.com"
                        required
                      />
                    </div>

                    {/* Host Server */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        SMTP Outgoing Server Host *
                      </label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                        placeholder="mail.savrdhfinancialservices.com or smtp.hostinger.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Port */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Port *
                      </label>
                      <select
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="465">465 (SSL / Recommended for Hosting)</option>
                        <option value="587">587 (TLS / STARTTLS)</option>
                        <option value="25">25 (Standard Non-SSL)</option>
                      </select>
                    </div>

                    {/* Mailbox Password */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mailbox Password / Webmail Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-900 border border-amber-500/50 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                          placeholder={currentPreset.passwordHint}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-300/80 mt-1">
                        {currentPreset.passwordHint}
                      </p>
                    </div>
                  </div>

                  {saveResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        saveResult.success
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                      }`}
                    >
                      {saveResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{saveResult.message}</p>
                        {saveResult.success && (
                          <p className="mt-1 text-[11px] text-emerald-300">
                            ✓ System is live! Customer OTPs, Invoices, KYC Alerts, and Lead Notices will now dispatch directly through your hosting server.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Encrypted with TLS 1.2+ & secure handshake.</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="submit"
                        disabled={isSavingConfig}
                        className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSavingConfig ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-navy-950" />
                            <span>Verifying & Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Save & Connect Hosting Mailbox</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Instant Test Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant Live Test Email</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Verify delivery to inbox</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={testEmailTarget}
                    onChange={(e) => setTestEmailTarget(e.target.value)}
                    placeholder="Enter email to test (e.g. savrdhcapital@gmail.com)"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendTestEmail()}
                    disabled={isSendingTest}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/30 disabled:opacity-50"
                  >
                    {isSendingTest ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test Email</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`mt-2.5 p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                      testResult.success
                        ? testResult.simulated
                          ? "bg-amber-950/30 border-amber-500/30 text-amber-200"
                          : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                        : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                    }`}
                  >
                    {testResult.success ? (
                      testResult.simulated ? (
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{testResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              {/* Mail Server Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sender Mailbox Identity</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Official From:</span>
                      <span className="font-semibold text-amber-300 font-mono">support@savrdhfinancialservices.com</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Host Server:</span>
                      <span className="text-slate-200 font-mono text-[11px]">{statusData?.smtpHost || smtpHost}:{statusData?.smtpPort || smtpPort}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Delivery Status:</span>
                      <span className={`font-semibold ${isLiveConfigured ? "text-emerald-400" : "text-amber-400"}`}>
                        {isLiveConfigured ? "Live Dispatching via Hosting SMTP" : "Active Simulator & Audit Logger"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin Real-Time Target</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Admin Notification:</span>
                      <span className="font-mono font-bold text-amber-300">savrdhcapital@gmail.com</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/50">
                      <span className="text-slate-400">Automatic Triggers:</span>
                      <span className="text-slate-200">Customer OTP, Login, KYC, CIBIL, Lead Sync</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Dispatches Logged:</span>
                      <span className="font-bold text-slate-100">{logs.length} emails tracked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Email Audit Logs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Recent Mail Dispatches from support@savrdhfinancialservices.com</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Auto-captured on all user events</span>
                </div>

                {logs.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-slate-400 text-xs">
                    No email dispatches recorded in this server session yet. Test by sending a test mail above.
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Recipient</th>
                          <th className="py-2.5 px-3">Subject / Event</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-2 px-3 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  log.recipientType === "ADMIN"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                }`}
                              >
                                {log.recipientType}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-300 max-w-[150px] truncate" title={log.to}>
                              {log.to}
                            </td>
                            <td className="py-2 px-3 text-slate-200 max-w-[200px] truncate" title={log.subject}>
                              <span className="font-semibold text-slate-100">{log.eventType}:</span>{" "}
                              <span className="text-slate-400">{log.subject}</span>
                            </td>
                            <td className="py-2 px-3 text-right whitespace-nowrap">
                              {log.status === "DELIVERED_LIVE" && (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                                  <Check className="w-3 h-3" /> Live Sent
                                </span>
                              )}
                              {log.status === "SIMULATED" && (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                                  <Info className="w-3 h-3" /> Simulated
                                </span>
                              )}
                              {log.status === "FAILED" && (
                                <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]" title={log.error}>
                                  <AlertTriangle className="w-3 h-3" /> Failed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HOSTING SETUP GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-4 text-xs text-slate-300">
              {/* Hostinger Official Guide */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-400" />
                    <span>Hostinger Email Server Configuration (Your Active Host)</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  As configured in your Hostinger hPanel for <code className="text-amber-300 font-mono font-bold">support@savrdhfinancialservices.com</code>:
                </p>

                {/* Exact Table from User Screenshot */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/90 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3.5 font-bold">Protocol</th>
                        <th className="py-2.5 px-3.5 font-bold">Hostname</th>
                        <th className="py-2.5 px-3.5 font-bold">Port</th>
                        <th className="py-2.5 px-3.5 font-bold text-center">TLS/SSL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3.5 text-slate-300 font-medium">Incoming server (IMAP)</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-300 font-bold">imap.hostinger.com</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-200 font-semibold">993</td>
                        <td className="py-2.5 px-3.5 text-center text-emerald-400 font-bold">✓ Active</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 bg-amber-500/5">
                        <td className="py-2.5 px-3.5 text-slate-300 font-medium flex items-center gap-1">
                          <span>Outgoing server (SMTP)</span>
                          <span className="text-[10px] text-amber-400 font-bold">(Used for Alerts)</span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-300 font-bold">smtp.hostinger.com</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-200 font-semibold">465</td>
                        <td className="py-2.5 px-3.5 text-center text-emerald-400 font-bold">✓ Active</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40 text-slate-500">
                        <td className="py-2.5 px-3.5">Incoming server (POP3)</td>
                        <td className="py-2.5 px-3.5 font-mono">pop.hostinger.com</td>
                        <td className="py-2.5 px-3.5 font-mono">995</td>
                        <td className="py-2.5 px-3.5 text-center">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <p className="font-semibold text-white">How to connect in 2 simple steps:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                    <li>Switch to the <strong>"Hosting Mail Server & Connector"</strong> tab above.</li>
                    <li>Enter your Hostinger Email password for <code className="text-amber-300 font-mono">support@savrdhfinancialservices.com</code> and click <strong>"Save & Connect Hosting Mailbox"</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* cPanel / Other Webmail Guide */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Other Hosting / cPanel Webmail</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  If using cPanel directly: Host: <code className="text-amber-300 font-mono">mail.savrdhfinancialservices.com</code> (Port 465 SSL).
                </p>
              </div>

              {/* Google Workspace Guide */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Google Workspace / Gmail</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  If hosted on Google Workspace, use <code className="text-amber-300 font-mono">smtp.gmail.com</code> (Port 587) with a 16-character Google App Password generated from <em>myaccount.google.com/apppasswords</em>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sender: <strong className="text-amber-300 font-mono">support@savrdhfinancialservices.com</strong></span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
