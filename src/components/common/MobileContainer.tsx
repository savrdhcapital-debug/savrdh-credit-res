import React, { useState } from "react";
import { Smartphone, Monitor, RotateCcw, ShieldCheck, Sparkles, ChevronRight, FileSpreadsheet, Scale } from "lucide-react";
import { AppStep } from "../../types";

interface MobileContainerProps {
  children: React.ReactNode;
  currentStep: AppStep;
  onResetFlow: () => void;
  onJumpToStep?: (step: AppStep) => void;
  onOpenAdminCRM?: () => void;
  onOpenCibilAnalyzer?: () => void;
  onOpenLoanAnalyzer?: () => void;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  currentStep,
  onResetFlow,
  onJumpToStep,
  onOpenAdminCRM,
  onOpenCibilAnalyzer,
  onOpenLoanAnalyzer,
}) => {
  const [deviceFrame, setDeviceFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#04070D] text-slate-100 flex flex-col items-center justify-start sm:py-6 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Testing Utility Bar for Customer App (Desktop View Only) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-lg mb-3 px-4 py-2 bg-navy-950/80 border border-slate-800/80 rounded-2xl text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">Savrdh App</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
            {currentStep}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenCibilAnalyzer && (
            <button
              onClick={onOpenCibilAnalyzer}
              className="py-1 px-2 rounded-lg bg-sky-500/15 border border-sky-500/30 hover:bg-sky-500/25 text-sky-300 font-semibold text-[10px] flex items-center gap-1 transition-colors"
              title="Forensic CIBIL PDF & Bureau Analyzer"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>CIBIL Tool</span>
            </button>
          )}

          {onOpenLoanAnalyzer && (
            <button
              onClick={onOpenLoanAnalyzer}
              className="py-1 px-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 text-indigo-300 font-semibold text-[10px] flex items-center gap-1 transition-colors"
              title="Forensic Loan Statement & RBI Violation Analyzer"
            >
              <Scale className="w-3 h-3" />
              <span>Loan Audit</span>
            </button>
          )}

          {onOpenAdminCRM && (
            <button
              onClick={onOpenAdminCRM}
              className="py-1 px-2 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 font-semibold text-[10px] flex items-center gap-1 transition-colors"
              title="Open Staff & Advocate CRM Login"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>CRM</span>
            </button>
          )}

          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="p-1 rounded-lg bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-slate-400 hover:text-amber-300 transition-colors"
            title={deviceFrame ? "Switch to Full Screen" : "Switch to Mobile Device Frame"}
          >
            {deviceFrame ? <Monitor className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
          </button>

          <button
            onClick={onResetFlow}
            className="p-1 rounded-lg bg-navy-900 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors"
            title="Reset to Splash / Step 1"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrame
            ? "sm:max-w-[430px] sm:rounded-[36px] sm:border sm:border-slate-700/80 sm:shadow-2xl sm:shadow-amber-500/10 sm:overflow-hidden sm:ring-8 sm:ring-navy-900/60 bg-[#070B14]"
            : "max-w-2xl bg-[#070B14]"
        } min-h-screen sm:min-h-[860px] flex flex-col relative`}
      >
        {/* Mobile Camera Notch / Dynamic Island Simulator on desktop frame */}
        {deviceFrame && (
          <div className="hidden sm:flex items-center justify-center pt-2 pb-1 bg-navy-950/90 border-b border-navy-900">
            <div className="w-24 h-4 rounded-full bg-black/90 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/80" />
            </div>
          </div>
        )}

        {/* Child Screen Content */}
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
};
