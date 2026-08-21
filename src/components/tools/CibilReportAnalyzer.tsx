import React, { useState, useRef } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Building,
  CreditCard,
  Search,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Upload,
  Sparkles,
  Download,
  Printer,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  Info,
  Check,
  Zap,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { CreditBureauReport, CreditAccountItem, ResolutionPackage } from "../../types";
import { SAMPLE_CIBIL_REPORTS, DEFAULT_CREDIT_REPORT, RESOLUTION_PACKAGES } from "../../data/mockData";
import { parseCibilReportApi } from "../../services/api";

interface CibilReportAnalyzerProps {
  initialReport?: CreditBureauReport;
  onApplyToApp?: (report: CreditBureauReport) => void;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const CibilReportAnalyzer: React.FC<CibilReportAnalyzerProps> = ({
  initialReport,
  onApplyToApp,
  onClose,
  isStandalone = false,
}) => {
  // Active Report State
  const [report, setReport] = useState<CreditBureauReport>(initialReport || SAMPLE_CIBIL_REPORTS[0].report);
  const [activeSampleId, setActiveSampleId] = useState<string>("sample-balram");
  const [inputMode, setInputMode] = useState<"DEMO" | "UPLOAD" | "PASTE">("DEMO");

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatusText, setAnalysisStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Expanded Accounts
  const [accountFilter, setAccountFilter] = useState<"ALL" | "ACTIVE" | "CLOSED" | "OVERDUE" | "WRITTEN_OFF" | "SETTLED" | "DPD_ISSUES">("ALL");
  const [expandedAccId, setExpandedAccId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch demo sample
  const handleSelectDemo = (sampleId: string) => {
    const s = SAMPLE_CIBIL_REPORTS.find((item) => item.id === sampleId);
    if (s) {
      setActiveSampleId(sampleId);
      setReport(s.report);
      setSuccessMsg(`Loaded sample report: ${s.name}`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  // Run Deep CIBIL Parser
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg("");
    setSuccessMsg("");
    setAnalysisProgress(15);
    setAnalysisStatusText("Reading CIBIL document byte stream...");

    const t1 = setTimeout(() => {
      setAnalysisProgress(40);
      setAnalysisStatusText("Scanning Tradelines, DPD records, and Inquiry history...");
    }, 400);

    const t2 = setTimeout(() => {
      setAnalysisProgress(75);
      setAnalysisStatusText("Executing Gemini Bureau Forensic Logic & RBI Compliance Audit...");
    }, 800);

    const t3 = setTimeout(() => {
      setAnalysisProgress(95);
      setAnalysisStatusText("Calculating Risk Bands & Customized Resolution Strategy...");
    }, 1200);

    try {
      const res = await parseCibilReportApi({
        fileName: uploadedFile?.name,
        fileDataUrl: uploadedFile?.dataUrl,
        manualDetails: {
          rawText: rawText.trim() || undefined,
        },
        customerName: report.verifiedProfile?.matchedName || "Customer",
        panNumber: report.verifiedProfile?.matchedPan || "ABCDE1234F",
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setAnalysisProgress(100);
      setAnalysisStatusText("Analysis Complete!");

      if (res.success && res.report) {
        setReport(res.report);
        setActiveSampleId("custom-upload");
        setSuccessMsg(`Successfully parsed ${res.report.bureauName} report with Score ${res.report.score}!`);
      } else {
        setErrorMsg("Failed to parse report data. Please check file format or paste raw text.");
      }
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setErrorMsg(err.message || "Failed to process CIBIL report.");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 400);
    }
  };

  // Evaluate Intelligent Plan Recommendation based on ACTUAL parsed data
  const getDynamicPlanRecommendation = () => {
    const score = report.score;
    const overdue = report.summary?.totalOverdue || 0;
    const writtenOff = report.summary?.writtenOffAccountsCount || 0;
    const settled = report.summary?.settledAccountsCount || 0;
    const dpdInstances = report.summary?.dpdInstances || 0;
    const inquiries = report.summary?.totalEnquiries || 0;

    // 1. All Clean / Healthy Profile
    if (score >= 750 && overdue === 0 && writtenOff === 0 && settled === 0 && dpdInstances === 0) {
      return {
        status: "HEALTHY",
        badgeText: "✅ Pristine Credit Profile (All OK)",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        recommendedPackageId: "pkg-maintenance",
        recommendedPackage: RESOLUTION_PACKAGES.find((p) => p.id === "pkg-maintenance") || RESOLUTION_PACKAGES[0],
        headline: "No Debt Dispute or Settlement Required",
        explanation: `With a strong credit score of ${score}, zero defaults, and zero DPD delays across all ${report.accounts?.length || 0} accounts, this profile is in prime health. No legal dispute or bank settlement is needed.`,
        actionAdvice: "We recommend our Credit Maintenance & Score Booster to continuously monitor for unauthorized inquiries, optimize credit utilization, and push the score above 820+.",
      };
    }

    // 2. Moderate / DPD / Inquiry Rectification Profile
    if (overdue === 0 && writtenOff === 0 && settled === 0 && (score < 750 || dpdInstances > 0 || inquiries >= 15)) {
      return {
        status: "MODERATE",
        badgeText: "⚠️ Moderate Bureau Inaccuracies & Legacy DPD",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        recommendedPackageId: "pkg-standard",
        recommendedPackage: RESOLUTION_PACKAGES.find((p) => p.id === "pkg-standard") || RESOLUTION_PACKAGES[1],
        headline: "DPD Tag Rectification & Inquiry Purge Recommended",
        explanation: `Total overdue is ₹0, but ${dpdInstances} historical DPD delay marks and ${inquiries} hard enquiries are dragging down the CIBIL algorithmic score to ${score}.`,
        actionAdvice: "We recommend our Standard Credit Rectification Plan to file Section 21 CICRA 2005 petitions, purge duplicate hard queries, and normalize past repayment tracks.",
      };
    }

    // 3. Severe / Default / Written-Off / Settled Profile
    return {
      status: "CRITICAL",
      badgeText: "🚨 Critical Default & Written-Off Accounts",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      recommendedPackageId: "pkg-comprehensive",
      recommendedPackage: RESOLUTION_PACKAGES.find((p) => p.id === "pkg-comprehensive") || RESOLUTION_PACKAGES[2],
      headline: "Comprehensive Advocate-Led Debt Settlement & OTS Required",
      explanation: `Detected ₹${overdue.toLocaleString()} in active overdue, ${writtenOff} Written-Off accounts, and ${settled} Settled tags. Heavy legal exposure under Section 138 / DRT with severely impaired credit rating of ${score}.`,
      actionAdvice: "We recommend our Comprehensive Debt Settlement & OTS Package for immediate advocate intervention, recovery agent stay, principal waiver negotiations, and NDC certificate procurement.",
    };
  };

  const planRecommendation = getDynamicPlanRecommendation();

  // Filter accounts
  const filteredAccounts = (report.accounts || []).filter((acc) => {
    if (accountFilter === "ALL") return true;
    if (accountFilter === "ACTIVE") return acc.status === "Active";
    if (accountFilter === "CLOSED") return acc.status === "Closed";
    if (accountFilter === "OVERDUE") return acc.overdueAmount > 0 || acc.status === "Overdue" || acc.status === "Defaulted";
    if (accountFilter === "WRITTEN_OFF") return acc.status === "Written-Off";
    if (accountFilter === "SETTLED") return acc.status === "Settled";
    if (accountFilter === "DPD_ISSUES") {
      return (acc.dpdHistory || []).some((h) => h.dpd !== "000" && h.dpd !== "STD" && h.dpd !== "XXX");
    }
    return true;
  });

  const getDpdBadgeClass = (dpd: string) => {
    switch (dpd) {
      case "000":
      case "STD":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "030":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "060":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "090":
      case "120":
      case "150":
      case "180":
      case "120+":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30 font-semibold";
      case "LSS":
        return "bg-rose-950 text-rose-200 border-rose-600/80 font-bold animate-pulse";
      case "SET":
        return "bg-purple-900/60 text-purple-200 border-purple-600/50 font-bold";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Forensic CIBIL & Credit Bureau Analyzer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>CIBIL Report Deep Diagnostic Suite</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Parses real CIBIL / Experian / Equifax / CRIF files, extracts actual tradelines, and dynamically calculates the exact resolution plan.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start sm:self-auto py-1.5 px-3 rounded-xl bg-navy-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold"
          >
            Close Tool
          </button>
        )}
      </div>

      {/* Input Mode Selector Bar */}
      <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Choose Data Source for Analysis:</span>
          <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setInputMode("DEMO")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === "DEMO" ? "bg-amber-500 text-navy-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Demo Samples (3)
            </button>
            <button
              onClick={() => setInputMode("UPLOAD")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === "UPLOAD" ? "bg-amber-500 text-navy-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Upload Any PDF
            </button>
            <button
              onClick={() => setInputMode("PASTE")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === "PASTE" ? "bg-amber-500 text-navy-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paste Raw Text
            </button>
          </div>
        </div>

        {/* DEMO SELECTOR */}
        {inputMode === "DEMO" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {SAMPLE_CIBIL_REPORTS.map((sample) => {
              const isSelected = activeSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectDemo(sample.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-navy-800/90 border-amber-500 ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10"
                      : "bg-navy-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100 truncate">{sample.name.split(" ")[0]} Profile</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        sample.score >= 750
                          ? "bg-emerald-500/20 text-emerald-300"
                          : sample.score >= 680
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      Score {sample.score}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{sample.tagline}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* UPLOAD MODE */}
        {inputMode === "UPLOAD" && (
          <div className="space-y-3 pt-1">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-navy-900/40 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">
                {uploadedFile ? uploadedFile.name : "Click or Drag & Drop ANY Real CIBIL / Experian PDF here"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {uploadedFile ? `Size: ${uploadedFile.size} • Ready for AI extraction` : "Supports TransUnion CIBIL, Experian, Equifax, and CRIF High Mark"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {uploadedFile && (
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110"
              >
                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-navy-950" />}
                <span>{isAnalyzing ? "Analyzing CIBIL PDF with Gemini AI..." : "Run Forensic CIBIL Analysis Now"}</span>
              </button>
            )}
          </div>
        )}

        {/* PASTE MODE */}
        {inputMode === "PASTE" && (
          <div className="space-y-2.5 pt-1">
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw CIBIL report text, bureau statements, or account summaries here..."
              className="w-full p-3 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !rawText.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-navy-950" />}
              <span>{isAnalyzing ? "Extracting Text & Accounts..." : "Parse Pasted Text"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Loading Progress Bar */}
      {isAnalyzing && (
        <div className="p-4 rounded-2xl bg-navy-900 border border-amber-500/30 space-y-2 text-center animate-pulse">
          <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-xs font-bold text-amber-300">{analysisStatusText}</p>
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* MAIN ANALYSIS REPORT VIEW */}
      <div className="space-y-5">
        {/* 1. Score & Bureau Header Card */}
        <div className="p-5 rounded-2xl navy-card-gold relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Bureau Score Circle */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-2xl bg-navy-950 border-2 border-amber-500/40 shadow-inner">
                <div className="text-center">
                  <span
                    className={`text-2xl font-black font-mono block ${
                      report.score >= 750 ? "text-emerald-400" : report.score >= 680 ? "text-amber-400" : "text-rose-400"
                    }`}
                  >
                    {report.score}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                    {report.scoreBand}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100">{report.bureauName}</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Verified
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Report Date: <span className="font-mono font-medium text-amber-200">{report.reportDate}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Control / ECN: <span className="font-mono text-slate-300">{report.controlNumber}</span>
                </p>
              </div>
            </div>

            {/* Customer Personal Identity Box */}
            <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 text-xs space-y-1 sm:max-w-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Borrower:</span>
                <span className="font-bold text-slate-200">{report.verifiedProfile?.matchedName || "Customer"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">PAN:</span>
                <span className="font-mono font-bold text-amber-300">{report.verifiedProfile?.matchedPan || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">DOB:</span>
                <span className="font-mono text-slate-300">{report.verifiedProfile?.matchedDob || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-800">
            <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-medium">Total Accounts</span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {report.accounts?.length || 0} Accounts
              </span>
              <span className="text-[9px] text-slate-500 block">
                ({report.summary?.activeLoansCount || 0} Active • {(report.accounts?.length || 0) - (report.summary?.activeLoansCount || 0)} Closed)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-medium">Total Outstanding</span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                ₹{(report.summary?.totalOutstanding || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500 block">Principal Debt</span>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-medium">Total Overdue / Default</span>
              <span
                className={`text-sm font-bold font-mono ${
                  (report.summary?.totalOverdue || 0) > 0 ? "text-rose-400 font-extrabold" : "text-emerald-400"
                }`}
              >
                ₹{(report.summary?.totalOverdue || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500 block">
                {(report.summary?.totalOverdue || 0) > 0 ? "⚠️ Critical Risk" : "✅ Regular"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-medium">DPD & Inquiries</span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {report.summary?.dpdInstances || 0} DPD Flags • {report.summary?.totalEnquiries || 0} Inq
              </span>
              <span className="text-[9px] text-slate-500 block">Past 24-36 Months</span>
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC PLAN RECOMMENDATION DECISION CARD */}
        <div className="p-5 rounded-2xl bg-navy-900 border-2 border-amber-500/60 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              <h3 className="text-sm font-bold text-slate-100">Dynamic Plan Suggestion Engine</h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${planRecommendation.badgeColor}`}>
              {planRecommendation.badgeText}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <div className="flex items-baseline justify-between">
              <h4 className="text-sm font-bold text-amber-300">{planRecommendation.headline}</h4>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Recommended: {planRecommendation.recommendedPackage.title}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{planRecommendation.explanation}</p>
            <div className="p-2.5 rounded-lg bg-navy-900/90 border border-amber-500/20 text-[11px] text-amber-200">
              <strong>Advocate Guidance:</strong> {planRecommendation.actionAdvice}
            </div>
          </div>

          {/* Apply to Onboarding App CTA */}
          {onApplyToApp && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Want to use this analyzed report in the customer onboarding resolution flow?
              </span>
              <button
                onClick={() => onApplyToApp(report)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110"
              >
                <span>Apply Report & Proceed to Plan Selection</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* 3. TRADELINES & LOAN ACCOUNTS AUDIT TABLE */}
        <div className="p-4 sm:p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Credit Accounts & Tradelines ({filteredAccounts.length} / {report.accounts?.length || 0})</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Inspect institutional loan types, balances, overdues, and DPD delay matrices.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              {(["ALL", "ACTIVE", "OVERDUE", "WRITTEN_OFF", "SETTLED", "DPD_ISSUES", "CLOSED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAccountFilter(tab)}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                    accountFilter === tab
                      ? "bg-amber-500 text-navy-950 font-bold"
                      : "bg-navy-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-2.5">
            {filteredAccounts.map((acc, index) => {
              const isExpanded = expandedAccId === (acc.id || `acc-${index}`);
              const hasDpdIssues = (acc.dpdHistory || []).some((h) => h.dpd !== "000" && h.dpd !== "STD" && h.dpd !== "XXX");

              return (
                <div
                  key={acc.id || index}
                  className={`p-3.5 rounded-xl border transition-all ${
                    acc.status === "Written-Off"
                      ? "bg-rose-950/20 border-rose-500/40"
                      : acc.status === "Settled"
                      ? "bg-purple-950/20 border-purple-500/30"
                      : acc.status === "Active"
                      ? "bg-navy-900/80 border-slate-800 hover:border-slate-700"
                      : "bg-navy-950/60 border-slate-900"
                  }`}
                >
                  {/* Account Header */}
                  <div
                    onClick={() => setExpandedAccId(isExpanded ? null : acc.id || `acc-${index}`)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          acc.status === "Written-Off"
                            ? "bg-rose-500/20 text-rose-300"
                            : acc.status === "Settled"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-100">{acc.institution}</h4>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                              acc.status === "Written-Off"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : acc.status === "Settled"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : acc.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {acc.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {acc.accountType} • A/C: <span className="font-mono text-slate-300">{acc.accountNumberMasked}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Balance</span>
                        <span className="text-xs font-bold font-mono text-slate-200">
                          ₹{acc.currentBalance.toLocaleString()}
                        </span>
                        {acc.overdueAmount > 0 && (
                          <span className="text-[10px] font-bold text-rose-400 block font-mono">
                            Overdue: ₹{acc.overdueAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Details & DPD Matrix */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-navy-950 p-2.5 rounded-lg">
                        <div>
                          <span className="text-slate-500 block">Sanctioned</span>
                          <span className="font-mono font-bold text-slate-200">₹{acc.sanctionedAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Opened Date</span>
                          <span className="font-mono text-slate-300">{acc.openedDate || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Last Reported</span>
                          <span className="font-mono text-slate-300">{acc.lastReportedDate || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">DPD Health</span>
                          <span className={hasDpdIssues ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                            {hasDpdIssues ? "Delays Recorded" : "Regular (000)"}
                          </span>
                        </div>
                      </div>

                      {/* DPD Monthly Heatmap */}
                      {acc.dpdHistory && acc.dpdHistory.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                            Monthly DPD (Days Past Due) Track:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {acc.dpdHistory.map((h, hIdx) => (
                              <div
                                key={hIdx}
                                className={`px-2 py-1 rounded border text-center font-mono text-[10px] ${getDpdBadgeClass(
                                  h.dpd
                                )}`}
                              >
                                <span className="block text-[8px] opacity-80">{h.month} {h.year?.slice(-2)}</span>
                                <span className="font-bold">{h.dpd}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. HARD ENQUIRIES LEDGER */}
        {report.enquiries && report.enquiries.length > 0 && (
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Hard Enquiries Audit ({report.enquiries.length} Enquiries Registered)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Excessive commercial inquiries indicate credit hunger and can lower CIBIL scores by 20 to 60 points.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {report.enquiries.map((enq, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-navy-900/60 border border-slate-800 text-[11px] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block truncate max-w-[180px]">{enq.lender}</span>
                    <span className="text-[10px] text-slate-400">{enq.purpose || "Credit Facility"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-slate-300 block">{enq.date}</span>
                    {enq.amount > 0 && (
                      <span className="text-[10px] font-mono text-amber-300">₹{enq.amount.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
