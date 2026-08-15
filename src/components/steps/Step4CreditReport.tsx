import React, { useState } from "react";
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
  Sparkles,
  Info
} from "lucide-react";
import { CreditBureauReport, KYCData } from "../../types";
import { DEFAULT_CREDIT_REPORT } from "../../data/mockData";

interface Step4Props {
  kycData: KYCData;
  onProceedToAnalysis: (report: CreditBureauReport) => void;
  initialReport?: CreditBureauReport;
}

export const Step4CreditReport: React.FC<Step4Props> = ({
  kycData,
  onProceedToAnalysis,
  initialReport = DEFAULT_CREDIT_REPORT,
}) => {
  const [hasFetched, setHasFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedBureau, setSelectedBureau] = useState<"TransUnion CIBIL" | "Experian" | "CRIF High Mark">("TransUnion CIBIL");
  const [report, setReport] = useState<CreditBureauReport>(initialReport);
  const [expandedAccount, setExpandedAccount] = useState<string | null>("acc-1");
  const [activeTab, setActiveTab] = useState<"ALL" | "DEFAULTS" | "WRITTEN_OFF" | "SETTLED" | "ENQUIRIES">("DEFAULTS");

  const handleFetchReport = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
      setHasFetched(true);
    }, 1500);
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

  const filteredAccounts = report.accounts.filter((acc) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "DEFAULTS") return acc.status === "Written-Off" || acc.overdueAmount > 0;
    if (activeTab === "WRITTEN_OFF") return acc.status === "Written-Off";
    if (activeTab === "SETTLED") return acc.status === "Settled";
    return true;
  });

  return (
    <div className="p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Step 4 of 8: Credit Bureau Report</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Live Credit Bureau Pull</h2>
        <p className="text-xs text-slate-400 mt-1">
          Authenticating with Credit Information Bureau for {kycData.fetchedProfile?.name || "Customer"}.
        </p>
      </div>

      {!hasFetched ? (
        <div className="p-5 rounded-2xl navy-card text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center">
            <FileText className="w-8 h-8 text-amber-400" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100">Pull Official Credit Bureau Record</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              We will query the central credit registry using your verified PAN (<strong className="text-slate-200">{kycData.panNumber}</strong>) and Aadhaar identity.
            </p>
          </div>

          {/* Bureau Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(["TransUnion CIBIL", "Experian", "CRIF High Mark"] as const).map((bureau) => (
              <button
                key={bureau}
                type="button"
                onClick={() => setSelectedBureau(bureau)}
                className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all border ${
                  selectedBureau === bureau
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                    : "bg-navy-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {bureau === "TransUnion CIBIL" ? "CIBIL (TU)" : bureau}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800/80 text-[11px] text-slate-400 text-left flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Soft Bureau Inquiry: Fetching this report will <strong>NOT</strong> lower your credit score.
            </span>
          </div>

          <button
            id="btn-fetch-credit-report"
            type="button"
            disabled={isFetching}
            onClick={handleFetchReport}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isFetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Connecting to {selectedBureau} API...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-navy-950 fill-navy-950" />
                <span>Get My Credit Report</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score Gauge Card */}
          <div className="p-4 rounded-2xl navy-card-gold relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">{selectedBureau} Report</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold">
                  Action Required
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Ctrl: {report.controlNumber}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 pb-2">
              {/* Score Circular Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500 transition-all duration-1000"
                    strokeDasharray={`${((report.score - 300) / 600) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
                    {report.score}
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    {report.scoreBand}
                  </span>
                  <span className="text-[9px] text-slate-500">Scale: 300-900</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex-1 pl-4 space-y-2 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-navy-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Total Overdue:</span>
                  <span className="font-bold text-rose-400 font-mono">
                    ₹{(report.summary.totalOverdue / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-navy-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Written-Off Accounts:</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {report.summary.writtenOffAccountsCount} Accounts
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-navy-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Settled Accounts:</span>
                  <span className="font-bold text-amber-300 font-mono">
                    {report.summary.settledAccountsCount} Account
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-navy-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Credit Utilization:</span>
                  <span className="font-bold text-rose-300 font-mono">
                    {report.summary.creditUtilizationPercent}% (High)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab("DEFAULTS")}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === "DEFAULTS"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-navy-900 text-slate-400 border border-slate-800"
              }`}
            >
              Default & Overdue ({report.summary.writtenOffAccountsCount})
            </button>
            <button
              onClick={() => setActiveTab("SETTLED")}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === "SETTLED"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-navy-900 text-slate-400 border border-slate-800"
              }`}
            >
              Settled ({report.summary.settledAccountsCount})
            </button>
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === "ALL"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-navy-900 text-slate-400 border border-slate-800"
              }`}
            >
              All Accounts ({report.accounts.length})
            </button>
            <button
              onClick={() => setActiveTab("ENQUIRIES")}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeTab === "ENQUIRIES"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-navy-900 text-slate-400 border border-slate-800"
              }`}
            >
              Enquiries ({report.enquiries.length})
            </button>
          </div>

          {/* Account List / Enquiries View */}
          {activeTab !== "ENQUIRIES" ? (
            <div className="space-y-2.5">
              {filteredAccounts.map((acc) => {
                const isExpanded = expandedAccount === acc.id;
                return (
                  <div
                    key={acc.id}
                    className="rounded-xl navy-card border border-slate-800 overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setExpandedAccount(isExpanded ? null : acc.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-navy-800/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`p-2 rounded-lg mt-0.5 ${
                            acc.status === "Written-Off"
                              ? "bg-rose-500/20 text-rose-400"
                              : acc.status === "Settled"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {acc.accountType === "Credit Card" ? (
                            <CreditCard className="w-4 h-4" />
                          ) : (
                            <Building className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{acc.institution}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{acc.accountType}</span>
                            <span>•</span>
                            <span className="font-mono">{acc.accountNumberMasked}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              acc.status === "Written-Off"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : acc.status === "Settled"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {acc.status}
                          </span>
                          <span className="text-[11px] font-bold text-slate-200 block mt-0.5 font-mono">
                            ₹{acc.overdueAmount > 0 ? acc.overdueAmount.toLocaleString() : acc.currentBalance.toLocaleString()}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-slate-800/80 bg-navy-950/60 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
                          <div>
                            <span className="text-slate-500 block">Sanctioned Limit:</span>
                            <span className="font-mono text-slate-200">
                              ₹{acc.sanctionedAmount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Reported Overdue:</span>
                            <span className="font-mono text-rose-400 font-bold">
                              ₹{acc.overdueAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* DPD Grid */}
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                            DPD (Days Past Due) Payment History
                          </span>
                          <div className="grid grid-cols-6 gap-1">
                            {acc.dpdHistory.map((dpd, i) => (
                              <div
                                key={i}
                                className={`p-1 rounded-lg border text-center text-[10px] ${getDpdBadgeClass(
                                  dpd.dpd
                                )}`}
                              >
                                <span className="text-[8px] block opacity-80">{dpd.month} {dpd.year.slice(2)}</span>
                                <span className="font-mono font-bold">{dpd.dpd}</span>
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
          ) : (
            <div className="space-y-2">
              {report.enquiries.map((enq, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl navy-card border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-200">{enq.lender}</h5>
                    <span className="text-[10px] text-slate-400">{enq.purpose} • {enq.date}</span>
                  </div>
                  <span className="font-mono font-semibold text-amber-300">
                    ₹{enq.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action CTA */}
          <button
            id="btn-proceed-ai-analysis"
            type="button"
            onClick={() => onProceedToAnalysis(report)}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Sparkles className="w-4 h-4 text-navy-950" />
            <span>Run AI Credit Diagnostic & Analysis</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
