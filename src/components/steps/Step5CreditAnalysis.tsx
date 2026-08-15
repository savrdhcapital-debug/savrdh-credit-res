import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Scale,
  Calendar,
  Zap,
  Target
} from "lucide-react";
import { AICreditAnalysis, CreditBureauReport, UserProfile } from "../../types";
import { INITIAL_AI_ANALYSIS } from "../../data/mockData";
import { fetchAiCreditAnalysis } from "../../services/api";

interface Step5Props {
  creditReport: CreditBureauReport;
  userProfile: UserProfile;
  onProceedToPricing: (analysis: AICreditAnalysis) => void;
  initialAnalysis?: AICreditAnalysis;
}

export const Step5CreditAnalysis: React.FC<Step5Props> = ({
  creditReport,
  userProfile,
  onProceedToPricing,
  initialAnalysis,
}) => {
  const [analysis, setAnalysis] = useState<AICreditAnalysis>(initialAnalysis || INITIAL_AI_ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [activeIssueIndex, setActiveIssueIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const runAi = async () => {
      setLoading(true);
      const res = await fetchAiCreditAnalysis(creditReport, userProfile.fullName);
      if (isMounted) {
        setAnalysis(res);
        setLoading(false);
      }
    };
    runAi();
    return () => {
      isMounted = false;
    };
  }, [creditReport, userProfile.fullName]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "HIGH":
        return "bg-orange-500/20 text-orange-300 border-orange-500/40";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <Brain className="w-3.5 h-3.5" />
          <span>Step 5 of 8: AI Credit Diagnostic</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Deep Credit Audit & Action Plan</h2>
        <p className="text-xs text-slate-400 mt-1">
          Automated resolution engine analyzed your {creditReport.bureauName} file against RBI Fair Practices Code.
        </p>
      </div>

      {loading ? (
        <div className="p-8 rounded-2xl navy-card text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-full h-full rounded-2xl bg-amber-500/20 animate-ping absolute inset-0" />
            <div className="w-full h-full rounded-2xl bg-navy-900 border border-amber-500/40 flex items-center justify-center relative">
              <Brain className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-100">Analyzing Negative Remarks with Gemini AI...</h3>
          <p className="text-xs text-slate-400">
            Evaluating Section 138 exposure, DPD histories, and calculating potential score recovery...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main AI Summary Box */}
          <div className="p-4 rounded-2xl navy-card-gold relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <span className="text-xs font-bold text-amber-300">Savrdh Resolution Diagnostic</span>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                Audit Verified
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {analysis.summary}
            </p>

            {/* Score Recovery Projection Card */}
            <div className="mt-4 p-3 rounded-xl bg-navy-950/90 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Current Score</span>
                  <span className="text-lg font-bold font-mono text-rose-400">{creditReport.score}</span>
                </div>

                <div className="flex flex-col items-center px-3">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{Math.abs(analysis.projectedScore - creditReport.score)} Pts</span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">
                    ~{analysis.estimatedRecoveryMonths}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Target Score</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{analysis.projectedScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Issues Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Detected Credit Issues ({analysis.keyIssues.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Click to view resolution strategy</span>
            </div>

            {analysis.keyIssues.map((issue, idx) => {
              const isSelected = activeIssueIndex === idx;
              return (
                <div
                  key={issue.id || idx}
                  onClick={() => setActiveIssueIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-navy-800/90 border-amber-500/50 shadow-md shadow-amber-500/10"
                      : "bg-navy-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{issue.title}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {issue.description}
                  </p>

                  {isSelected && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>Savrdh Legal Resolution Roadmap:</span>
                      </div>
                      <p className="text-[11px] text-slate-300 bg-navy-950/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                        {issue.actionPlan}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recommended Resolution Plan Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-700/10 border border-amber-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block">
                Recommended Solution
              </span>
              <h4 className="text-xs font-bold text-slate-100 mt-0.5">
                {analysis.recommendedPlan}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {analysis.expertTakeaway || "Advocate-led negotiation to secure One-Time Settlement with No-Dues Certificates and CIBIL status rectification."}
              </p>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            id="btn-proceed-pricing"
            type="button"
            onClick={() => onProceedToPricing(analysis)}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Pricing & Resolution Packages</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
