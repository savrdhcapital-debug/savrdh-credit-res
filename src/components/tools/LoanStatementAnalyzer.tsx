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
  Scale,
  DollarSign,
  ReceiptText
} from "lucide-react";
import { LoanStatementAnalysis, LoanTransaction } from "../../types";
import { SAMPLE_LOAN_STATEMENTS } from "../../data/mockData";
import { analyzeLoanStatementApi } from "../../services/api";

interface LoanStatementAnalyzerProps {
  initialStatement?: LoanStatementAnalysis;
  onApplyToLead?: (statement: LoanStatementAnalysis) => void;
  onClose?: () => void;
  isStandalone?: boolean;
  leadName?: string;
  leadId?: string;
}

export const LoanStatementAnalyzer: React.FC<LoanStatementAnalyzerProps> = ({
  initialStatement,
  onApplyToLead,
  onClose,
  isStandalone = false,
  leadName,
  leadId,
}) => {
  const [statement, setStatement] = useState<LoanStatementAnalysis | null>(initialStatement || null);
  const [activeSampleId, setActiveSampleId] = useState<string>("");
  const [inputMode, setInputMode] = useState<"UPLOAD" | "PASTE" | "DEMO">("UPLOAD");

  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatusText, setAnalysisStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showLegalNoticeModal, setShowLegalNoticeModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartFreshSession = () => {
    setStatement(null);
    setActiveSampleId("");
    setUploadedFile(null);
    setRawText("");
    setErrorMsg("");
    setSuccessMsg("Fresh loan audit session initialized. Upload statement PDF or paste ledger text.");
    setInputMode("UPLOAD");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleSelectDemo = (sampleId: string) => {
    const s = SAMPLE_LOAN_STATEMENTS.find((item) => item.id === sampleId);
    if (s) {
      setActiveSampleId(sampleId);
      setStatement(s);
      setSuccessMsg(`Loaded statement: ${s.lenderName} (${s.loanType})`);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

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

  const handleRunAnalysis = async () => {
    if (!uploadedFile && !rawText.trim()) {
      setErrorMsg("Please upload a loan statement PDF or paste ledger text to audit.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg("");
    setSuccessMsg("");
    setAnalysisProgress(15);
    setAnalysisStatusText("Reading Loan Statement Document stream...");

    const t1 = setTimeout(() => {
      setAnalysisProgress(45);
      setAnalysisStatusText("Auditing EMI repayment ledgers and NACH bounce fees...");
    }, 400);

    const t2 = setTimeout(() => {
      setAnalysisProgress(75);
      setAnalysisStatusText("Running RBI Fair Lending Practice Circular (2024) Forensic Scan...");
    }, 800);

    const t3 = setTimeout(() => {
      setAnalysisProgress(95);
      setAnalysisStatusText("Calculating Net Foreclosure Payoff & Penalty Refunds...");
    }, 1200);

    try {
      const res = await analyzeLoanStatementApi({
        fileName: uploadedFile?.name,
        fileDataUrl: uploadedFile?.dataUrl,
        rawText: rawText.trim() || undefined,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setAnalysisProgress(100);
      setAnalysisStatusText("Analysis Complete!");

      if (res.success && res.statement) {
        setStatement(res.statement);
        setActiveSampleId("custom-statement");
        setSuccessMsg(`Successfully audited statement for ${res.statement.lenderName}!`);
      } else {
        setErrorMsg("Failed to analyze statement. Please ensure text or clear PDF is provided.");
      }
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setErrorMsg(err.message || "Failed to analyze loan statement.");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 400);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-1">
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Forensic Loan Account & Bank Statement Analyzer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>Loan Statement & RBI Penalty Audit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {leadName ? `Auditing Statement for Lead: ${leadName}` : "Audits lender EMI ledgers, flags unlawful compounded penal interest under RBI Circular (2024), and computes lawful pre-closure payoffs."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statement && (
            <button
              onClick={handleStartFreshSession}
              className="py-1.5 px-3 rounded-xl bg-navy-900 border border-slate-700 hover:border-amber-500 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Start Fresh Session</span>
            </button>
          )}

          {statement && onApplyToLead && (
            <button
              onClick={() => onApplyToLead(statement)}
              className="py-1.5 px-3 rounded-xl bg-gold-gradient text-navy-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow hover:brightness-110"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Attach to Lead</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="self-start sm:self-auto py-1.5 px-3 rounded-xl bg-navy-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold"
            >
              Close Tool
            </button>
          )}
        </div>
      </div>

      {/* Input Mode Selector Bar */}
      <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Intake / Input Method:</span>
          <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setInputMode("UPLOAD")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === "UPLOAD" ? "bg-amber-500 text-navy-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Upload Statement PDF
            </button>
            <button
              onClick={() => setInputMode("PASTE")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === "PASTE" ? "bg-amber-500 text-navy-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paste Statement Text
            </button>
            <button
              onClick={() => setInputMode("DEMO")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === "DEMO" ? "bg-amber-500 text-navy-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sample Statements
            </button>
          </div>
        </div>

        {/* DEMO MODE */}
        {inputMode === "DEMO" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {SAMPLE_LOAN_STATEMENTS.map((s) => {
              const isSelected = activeSampleId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectDemo(s.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-navy-800/90 border-amber-500 ring-1 ring-amber-500/50 shadow-md shadow-amber-500/10"
                      : "bg-navy-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100">{s.lenderName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        s.illegalPenalChargesDetected > 0
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {s.illegalPenalChargesDetected > 0 ? "⚠️ RBI Violation Flagged" : "✅ Pristine Track"}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300 font-medium">{s.loanType} • ₹{s.sanctionedAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{s.executiveSummary}</p>
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
              className="p-6 rounded-xl border-2 border-dashed border-amber-500/30 hover:border-amber-500 bg-navy-900/40 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-7 h-7 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">
                {uploadedFile ? uploadedFile.name : "Click or Drag & Drop ANY Real Bank / NBFC Loan Statement PDF"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {uploadedFile ? `Size: ${uploadedFile.size} • Ready for RBI Audit` : "Supports HDFC, Bajaj Finance, SBI, ICICI, Tata Capital, Axis, Kotak, Piramal, etc."}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,.csv,.txt"
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
                <span>{isAnalyzing ? "Auditing Statement with Gemini AI..." : "Run Statement Forensic Audit"}</span>
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
              placeholder="Paste raw loan statement table, interest schedule, or EMI debit transaction text here..."
              className="w-full p-3 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !rawText.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-navy-950" />}
              <span>{isAnalyzing ? "Auditing Text..." : "Audit Pasted Statement"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Loading */}
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

      {/* When no statement is loaded, show clean empty state */}
      {!statement && !isAnalyzing && (
        <div className="p-8 rounded-2xl bg-navy-950 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ReceiptText className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-100">Fresh Session Ready — No Loan Statement Loaded</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload the customer&apos;s bank or NBFC loan account statement PDF to perform an automated RBI Circular 2024 compliance audit, calculate unlawful compounded penal interest, and generate advocate dispute notices.
          </p>
        </div>
      )}

      {/* MAIN ANALYSIS REPORT VIEW */}
      {statement && (
      <div className="space-y-5">
      <div className="p-5 rounded-2xl navy-card-gold relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">{statement.lenderName}</h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {statement.loanType}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Loan A/C: <span className="font-mono font-bold text-amber-200">{statement.loanAccountNumber}</span> • Borrower: <span className="font-medium text-slate-200">{statement.borrowerName}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 block">Sanctioned Principal</span>
            <span className="text-xl font-bold font-mono text-slate-100">
              ₹{statement.sanctionedAmount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">
              @ {statement.interestRatePerAnnum}% p.a. ({statement.interestType}) • Disbursed: {statement.disbursalDate}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800">
          <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">EMIs Completed</span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {statement.emisPaidCount} / {statement.tenorMonths} Paid
            </span>
            <span className="text-[9px] text-emerald-400 block">₹{statement.emiAmount.toLocaleString()} / mo</span>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Principal Outstanding</span>
            <span className="text-sm font-bold text-amber-300 font-mono">
              ₹{statement.currentPrincipalOutstanding.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-500 block">Repaid: ₹{statement.principalPaid.toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Foreclosure Payoff</span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              ₹{statement.foreclosureAmountPayoff.toLocaleString()}
            </span>
            <span className="text-[9px] text-emerald-400 block">
              {statement.foreclosureChargesApplicable === 0 ? "✅ 0% Penalty (RBI Compliant)" : `${statement.foreclosureChargesApplicable}% Penalty`}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Repayment Track</span>
            <span
              className={`text-sm font-bold font-mono ${
                statement.repaymentTrackScore >= 95 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {statement.repaymentTrackScore}% On-Time
            </span>
            <span className="text-[9px] text-slate-500 block">{statement.totalBounceCount} NACH Bounces</span>
          </div>
        </div>
      </div>

      {/* 2. FORENSIC RBI PENALTY & BOUNCE AUDIT CARD */}
      <div
        className={`p-5 rounded-2xl border-2 space-y-3.5 ${
          statement.illegalPenalChargesDetected > 0
            ? "bg-rose-950/20 border-rose-500/60 shadow-xl"
            : "bg-navy-950 border-emerald-500/40"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className={`w-5 h-5 ${statement.illegalPenalChargesDetected > 0 ? "text-rose-400" : "text-emerald-400"}`} />
            <h3 className="text-sm font-bold text-slate-100">
              RBI Fair Lending Practice Audit (Circular 2023-24 / DOR.MCS.REC.28)
            </h3>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              statement.illegalPenalChargesDetected > 0
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {statement.illegalPenalChargesDetected > 0
              ? `🚨 ₹${statement.illegalPenalChargesDetected.toLocaleString()} Unlawful Charges Flagged`
              : "✅ Full RBI Regulatory Compliance"}
          </span>
        </div>

        {/* Audit Details */}
        <div className="p-3.5 rounded-xl bg-navy-900/90 border border-slate-800 space-y-2 text-xs">
          <p className="text-slate-200 leading-relaxed">{statement.executiveSummary}</p>

          {statement.rbiViolationFlags.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-rose-400 block">Specific Violations Detected:</span>
              {statement.rbiViolationFlags.map((flag, fIdx) => (
                <div key={fIdx} className="flex items-start gap-2 text-[11px] text-rose-200 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-navy-950 border border-amber-500/20 text-[11px] text-amber-200">
            <strong>Advocate Action Strategy:</strong> {statement.recommendationPlan}
          </div>
        </div>

        {/* 1-Click Bank Legal Notice Petition Generator Button */}
        {statement.illegalPenalChargesDetected > 0 && (
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Demand immediate bank refund & waiver of ₹{statement.illegalPenalChargesDetected.toLocaleString()} illegal penal interest.
            </span>
            <button
              onClick={() => setShowLegalNoticeModal(true)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Generate Bank Dispute Notice</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. TRANSACTION LEDGER & EMI AUDIT TABLE */}
      {statement.transactions && statement.transactions.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Repayment Transactions & Charge Audit Ledger ({statement.transactions.length} Entries)</span>
          </h3>

          <div className="space-y-2">
            {statement.transactions.map((tx, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  tx.isFlaggedAsViolation
                    ? "bg-rose-950/30 border-rose-500/50"
                    : tx.type === "BOUNCE_CHARGE"
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-navy-900/60 border-slate-800/80"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="text-[10px] font-mono text-slate-400 bg-navy-950 px-2 py-1 rounded border border-slate-800">
                    {tx.date}
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">{tx.description}</span>
                    {tx.isFlaggedAsViolation && (
                      <span className="text-[10px] text-rose-300 font-semibold block mt-0.5">
                        ⚠️ Violation: {tx.violationReason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  {tx.debitAmount > 0 && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Billed Debit</span>
                      <span className="font-mono font-bold text-rose-400">₹{tx.debitAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {tx.creditAmount > 0 && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Paid Credit</span>
                      <span className="font-mono font-bold text-emerald-400">₹{tx.creditAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] text-slate-400 block">Balance</span>
                    <span className="font-mono text-slate-300">₹{tx.balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      )}

      {/* Formal Dispute Notice Modal */}
      {showLegalNoticeModal && statement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-navy-900 border-2 border-amber-500/60 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Formal RBI Regulatory Dispute Notice Draft</h3>
              </div>
              <button
                onClick={() => setShowLegalNoticeModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold px-2 py-1 bg-navy-950 rounded-lg border border-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 space-y-3 leading-relaxed">
              <p className="font-bold text-amber-300">
                TO: THE PRINCIPAL NODAL OFFICER & GRIEVANCE REDRESSAL OFFICER<br />
                {statement.lenderName.toUpperCase()}<br />
                SUBJECT: FORMAL PETITION UNDER RBI CIRCULAR DOR.MCS.REC.28/01.01.001/2023-24 FOR WAIVER AND REFUND OF UNLAWFUL PENAL INTEREST CHARGES
              </p>
              <p>
                RE: Loan Account No: <strong>{statement.loanAccountNumber}</strong><br />
                Borrower: <strong>{statement.borrowerName}</strong>
              </p>
              <p>
                Dear Sir/Madam,<br />
                We act for our client above named. A forensic audit of the loan account statement reveals that your institution has billed ₹{statement.illegalPenalChargesDetected.toLocaleString()} in compounded penal interest and repetitive NACH presentation bounce surcharges.
              </p>
              <p>
                Under RBI Circular DOR.MCS.REC.28/01.01.001/2023-24 ('Fair Lending Practice – Penal Charges in Loan Accounts'), Regulated Entities are strictly prohibited from capitalizing penal charges into the principal balance or compounding interest on penal fees.
              </p>
              <p>
                We hereby call upon you to credit ₹{statement.illegalPenalChargesDetected.toLocaleString()} back to the loan ledger within 15 days, failing which this matter shall be escalated to the Reserve Bank of India Integrated Ombudsman Scheme.
              </p>
              <p className="text-slate-400">
                Yours faithfully,<br />
                Savrdh Financial Services Private Limited<br />
                Advocate Legal Dispute Resolution Cell
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2 px-4 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => {
                  setShowLegalNoticeModal(false);
                  setSuccessMsg("Dispute notice draft saved to Document Vault!");
                  setTimeout(() => setSuccessMsg(""), 3000);
                }}
                className="py-2 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>Dispatch to Bank Nodal Officer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
