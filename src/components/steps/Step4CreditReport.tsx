import React, { useState, useRef } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Building,
  CreditCard,
  Search,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Upload,
  QrCode,
  ShieldCheck,
  Lock,
  Receipt,
  FileCheck2,
  AlertCircle
} from "lucide-react";
import { CreditBureauReport, KYCData } from "../../types";
import { createCibilOrderApi, verifyCibilPaymentApi, parseCibilReportApi } from "../../services/api";

interface Step4Props {
  kycData: KYCData;
  onProceedToAnalysis: (report: CreditBureauReport) => void;
  initialReport?: CreditBureauReport;
}

export const Step4CreditReport: React.FC<Step4Props> = ({
  kycData,
  onProceedToAnalysis,
  initialReport,
}) => {
  // Stages: "FEE_PAYMENT" -> "REPORT_PROCUREMENT" -> "REPORT_VIEW"
  const [stage, setStage] = useState<"FEE_PAYMENT" | "REPORT_PROCUREMENT" | "REPORT_VIEW">("FEE_PAYMENT");

  // ₹350 Fee Payment State
  const [isPayingFee, setIsPayingFee] = useState(false);
  const [feePaymentDetails, setFeePaymentDetails] = useState<{
    paymentId: string;
    invoiceNumber: string;
    paidAt: string;
  } | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState<"UPI" | "CARD" | "NET_BANKING">("UPI");

  // CIBIL Procurement State
  const [procurementMethod, setProcurementMethod] = useState<"UPLOAD" | "API_FETCH" | "MANUAL">("UPLOAD");
  const [uploadedCibilFile, setUploadedCibilFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [isParsingReport, setIsParsingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Manual fallback inputs
  const [manualScore, setManualScore] = useState("582");
  const [manualOverdue, setManualOverdue] = useState("485000");

  // Loaded Credit Report
  const [report, setReport] = useState<CreditBureauReport | null>(initialReport || null);
  const [expandedAccount, setExpandedAccount] = useState<string | null>("acc-cibil-1");
  const [activeTab, setActiveTab] = useState<"ALL" | "DEFAULTS" | "WRITTEN_OFF" | "SETTLED">("DEFAULTS");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle ₹350 Payment
  const handlePayCibilFee = async () => {
    setIsPayingFee(true);
    setErrorMsg("");

    try {
      const orderRes = await createCibilOrderApi({
        customerName: kycData.fetchedProfile?.name || "Customer",
        customerEmail: "support@savrdhfinancialservices.com",
        customerMobile: "9876543210",
        panNumber: kycData.panNumber,
      });

      // If live Razorpay key is present and Razorpay JS is loaded, open popup
      if (orderRes.isLiveRazorpay && (window as any).Razorpay) {
        const options = {
          key: orderRes.keyId,
          amount: 35000,
          currency: "INR",
          name: "Savrdh Financial Services",
          description: "CIBIL Report Extraction & Deep Diagnostic Audit Fee",
          order_id: orderRes.order?.id,
          prefill: {
            name: kycData.fetchedProfile?.name || "Customer",
            email: "support@savrdhfinancialservices.com",
          },
          theme: { color: "#D4AF37" },
          handler: async (response: any) => {
            const verifyRes = await verifyCibilPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customerName: kycData.fetchedProfile?.name || "Customer",
              customerEmail: "support@savrdhfinancialservices.com",
              customerMobile: "9876543210",
              panNumber: kycData.panNumber,
              paymentMethod: selectedPayMethod,
            });

            if (verifyRes.success) {
              setFeePaymentDetails(verifyRes.cibilPaymentDetails);
              setStage("REPORT_PROCUREMENT");
            }
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct Verification flow
        const verifyRes = await verifyCibilPaymentApi({
          razorpay_order_id: orderRes.order?.id || `order_cibil_${Date.now()}`,
          razorpay_payment_id: `pay_cibil_${Date.now()}`,
          customerName: kycData.fetchedProfile?.name || "Customer",
          customerEmail: "support@savrdhfinancialservices.com",
          customerMobile: "9876543210",
          panNumber: kycData.panNumber,
          paymentMethod: selectedPayMethod,
        });

        if (verifyRes.success) {
          setFeePaymentDetails(verifyRes.cibilPaymentDetails);
          setStage("REPORT_PROCUREMENT");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to process payment. Please try again.");
    } finally {
      setIsPayingFee(false);
    }
  };

  // Handle PDF Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setUploadedCibilFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  // Parse & Load CIBIL Report
  const handleProcessCibilReport = async () => {
    setIsParsingReport(true);
    setErrorMsg("");

    try {
      const parseRes = await parseCibilReportApi({
        fileName: uploadedCibilFile?.name,
        fileDataUrl: uploadedCibilFile?.dataUrl,
        manualDetails: {
          score: parseInt(manualScore) || 582,
          totalDefault: parseInt(manualOverdue) || 485000,
        },
        customerName: kycData.fetchedProfile?.name || "Customer",
        panNumber: kycData.panNumber,
      });

      if (parseRes.success && parseRes.report) {
        setReport(parseRes.report);
        setStage("REPORT_VIEW");
      } else {
        setErrorMsg("Failed to parse credit report. Please check the file.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process credit bureau report.");
    } finally {
      setIsParsingReport(false);
    }
  };

  const getDpdBadgeClass = (dpd: string) => {
    switch (dpd) {
      case "000":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "030":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "060":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "090":
      case "120+":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "LSS":
        return "bg-rose-950/80 text-rose-200 border-rose-600/60 font-bold";
      case "SET":
        return "bg-amber-900/60 text-amber-200 border-amber-600/50";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  const filteredAccounts = report?.accounts.filter((acc) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "DEFAULTS") return acc.status === "Written-Off" || acc.overdueAmount > 0;
    if (activeTab === "WRITTEN_OFF") return acc.status === "Written-Off";
    if (activeTab === "SETTLED") return acc.status === "Settled";
    return true;
  }) || [];

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto">
      {/* Step Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Step 4 of 8: Official CIBIL Report Extraction</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">CIBIL Report & Bureau Audit</h2>
        <p className="text-xs text-slate-400 mt-1">
          PAN: <strong className="text-amber-400 font-mono">{kycData.panNumber}</strong> • Name: {kycData.fetchedProfile?.name || "Customer"}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: ₹350 CIBIL EXTRACTION FEE PAYMENT */}
      {/* ========================================================================= */}
      {stage === "FEE_PAYMENT" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl navy-card space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center">
              <Receipt className="w-7 h-7 text-amber-400" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-100">
                Official CIBIL Bureau Audit Fee
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                As per regulatory credit bureau guidelines, a one-time retrieval & diagnostic fee of <strong>₹350.00</strong> is required to pull and parse your complete credit registry file.
              </p>
            </div>

            {/* Price Card */}
            <div className="p-4 rounded-xl bg-navy-950/90 border border-amber-500/30 text-center space-y-1">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Payable Amount</p>
              <div className="text-3xl font-extrabold text-amber-400 font-heading">
                ₹350.00
              </div>
              <p className="text-[10px] text-emerald-400 font-medium">
                Includes 18% GST (Base: ₹296.61 + GST: ₹53.39) • Official Tax Invoice Issued
              </p>
            </div>

            {/* What's included */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Complete TransUnion CIBIL / Experian Credit History</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Written-Off & Settled Account DPD Default Audit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant Tax Invoice sent from support@savrdhfinancialservices.com</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">Select Payment Method:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "UPI", label: "UPI / QR", icon: QrCode },
                  { id: "CARD", label: "Cards", icon: CreditCard },
                  { id: "NET_BANKING", label: "NetBanking", icon: Building },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedPayMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        selectedPayMethod === m.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-navy-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            disabled={isPayingFee}
            onClick={handlePayCibilFee}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isPayingFee ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Processing ₹350 Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹350 & Unlock CIBIL Report</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: CIBIL REPORT PROCUREMENT / UPLOAD */}
      {/* ========================================================================= */}
      {stage === "REPORT_PROCUREMENT" && (
        <div className="space-y-4">
          {/* Payment Success Badge */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold">₹350 Fee Paid & Verified</p>
                <p className="text-[10px] text-emerald-400/80">Invoice: {feePaymentDetails?.invoiceNumber || "SAV-CIBIL-INV"}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              PAID
            </span>
          </div>

          <div className="p-5 rounded-2xl navy-card space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              Upload / Extract Customer CIBIL Report
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload the 3rd-party CIBIL report PDF (e.g. from CIBIL, Paisabazaar, or bank desk) or pull automatically via bureau gateway.
            </p>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-navy-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setProcurementMethod("UPLOAD")}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  procurementMethod === "UPLOAD"
                    ? "bg-amber-500 text-navy-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CIBIL PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setProcurementMethod("API_FETCH")}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  procurementMethod === "API_FETCH"
                    ? "bg-amber-500 text-navy-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Fetch Bureau</span>
              </button>
            </div>

            {/* Option A: Upload PDF */}
            {procurementMethod === "UPLOAD" && (
              <div className="space-y-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    uploadedCibilFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-700/80 hover:border-amber-500/50 bg-navy-950/60"
                  }`}
                >
                  {uploadedCibilFile ? (
                    <div className="space-y-2">
                      <FileCheck2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-200">{uploadedCibilFile.name}</p>
                      <p className="text-[10px] text-emerald-400">{uploadedCibilFile.size} • Ready for deep analysis</p>
                      <span className="text-[10px] text-amber-400 underline block">Click to change file</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-200">Click to Select CIBIL Report PDF</p>
                      <p className="text-[10px] text-slate-400">Supports Official TransUnion CIBIL & Experian PDFs</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Option B: API Fetch */}
            {procurementMethod === "API_FETCH" && (
              <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Savrdh Credit Bureau Gateway</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts live score and default records directly using verified PAN <strong>{kycData.panNumber}</strong> and Aadhaar eKYC.
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            disabled={isParsingReport}
            onClick={handleProcessCibilReport}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isParsingReport ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Analyzing CIBIL Report Data...</span>
              </>
            ) : (
              <>
                <span>Extract & View CIBIL Report</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: CIBIL REPORT VIEW & BREAKDOWN */}
      {/* ========================================================================= */}
      {stage === "REPORT_VIEW" && report && (
        <div className="space-y-4">
          {/* CIBIL Score Card */}
          <div className="p-5 rounded-2xl navy-card relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                  {report.bureauName}
                </span>
                <span className="text-xs text-slate-400">Control No: {report.controlNumber}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                {report.scoreBand.toUpperCase()} CREDIT HEALTH
              </span>
            </div>

            <div className="my-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Calculated CIBIL Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-rose-400 font-heading">
                    {report.score}
                  </span>
                  <span className="text-xs text-slate-500">/ 900</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">Total Default Amount</p>
                <p className="text-xl font-bold text-rose-400">
                  ₹{report.summary.totalOverdue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-navy-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-400">Written-Off</p>
                <p className="text-sm font-bold text-rose-400">{report.summary.writtenOffAccountsCount} Accts</p>
              </div>
              <div className="p-2 rounded-xl bg-navy-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-400">Settled</p>
                <p className="text-sm font-bold text-amber-400">{report.summary.settledAccountsCount} Acct</p>
              </div>
              <div className="p-2 rounded-xl bg-navy-950/60 border border-slate-800">
                <p className="text-[10px] text-slate-400">Utilization</p>
                <p className="text-sm font-bold text-rose-400">{report.summary.creditUtilizationPercent}%</p>
              </div>
            </div>
          </div>

          {/* Account Breakdown Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200">
                Credit Accounts ({report.accounts.length})
              </h3>
              <div className="flex gap-1">
                {(["DEFAULTS", "ALL"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-1 rounded-md text-[10px] font-semibold ${
                      activeTab === tab
                        ? "bg-amber-500 text-navy-950 font-bold"
                        : "bg-navy-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab === "DEFAULTS" ? "Negative Marks" : "All Accounts"}
                  </button>
                ))}
              </div>
            </div>

            {/* Accounts List */}
            <div className="space-y-2">
              {filteredAccounts.map((acc) => {
                const isExpanded = expandedAccount === acc.id;
                return (
                  <div
                    key={acc.id}
                    className="rounded-xl navy-card border border-slate-800 overflow-hidden text-xs"
                  >
                    <div
                      onClick={() => setExpandedAccount(isExpanded ? null : acc.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-navy-800/40"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-100">{acc.institution}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({acc.accountType})</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Overdue: <strong className="text-rose-400">₹{acc.overdueAmount.toLocaleString("en-IN")}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          acc.status === "Written-Off"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {acc.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 bg-navy-950/70 border-t border-slate-800/80 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400">Account No: </span>
                            <span className="text-slate-200 font-mono">{acc.accountNumberMasked}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Sanctioned: </span>
                            <span className="text-slate-200">₹{acc.sanctionedAmount.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        {/* DPD String */}
                        <div>
                          <p className="text-[10px] text-slate-400 mb-1">Recent 6-Month DPD Repayment Track:</p>
                          <div className="flex gap-1.5">
                            {acc.dpdHistory.map((dpd, idx) => (
                              <div
                                key={idx}
                                className={`px-2 py-1 rounded text-[10px] font-mono text-center border ${getDpdBadgeClass(dpd.dpd)}`}
                              >
                                <div>{dpd.month}</div>
                                <div className="font-bold">{dpd.dpd}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onProceedToAnalysis(report)}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to CIBIL Analysis & Resolution Plans</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
