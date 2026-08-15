import React from "react";
import { Check, ShieldCheck, User, FileText, Brain, CreditCard, Sparkles } from "lucide-react";
import { AppStep } from "../../types";

interface FlowStepperProps {
  currentStep: AppStep;
  onStepClick?: (step: AppStep) => void;
}

const STEPS_CONFIG: { step: AppStep; label: string; stepNumber: number; icon: React.ReactNode }[] = [
  { step: "REGISTRATION", label: "Register", stepNumber: 1, icon: <User className="w-3.5 h-3.5" /> },
  { step: "KYC", label: "eKYC", stepNumber: 2, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { step: "CREDIT_REPORT", label: "Bureau", stepNumber: 3, icon: <FileText className="w-3.5 h-3.5" /> },
  { step: "CREDIT_ANALYSIS", label: "AI Audit", stepNumber: 4, icon: <Brain className="w-3.5 h-3.5" /> },
  { step: "PRICING", label: "Plans", stepNumber: 5, icon: <Sparkles className="w-3.5 h-3.5" /> },
  { step: "PAYMENT", label: "Payment", stepNumber: 6, icon: <CreditCard className="w-3.5 h-3.5" /> },
];

export const FlowStepper: React.FC<FlowStepperProps> = ({ currentStep }) => {
  const getStepIndex = (step: AppStep): number => {
    switch (step) {
      case "SPLASH":
        return 0;
      case "REGISTRATION":
        return 1;
      case "KYC":
        return 2;
      case "CREDIT_REPORT":
        return 3;
      case "CREDIT_ANALYSIS":
        return 4;
      case "PRICING":
        return 5;
      case "PAYMENT":
      case "CRM_SYNC":
      case "DASHBOARD":
        return 6;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full px-4 py-3 bg-navy-950/90 border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-30 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {STEPS_CONFIG.map((s, idx) => {
          const stepNum = s.stepNumber;
          const isCompleted = stepNum < currentIndex;
          const isCurrent = stepNum === currentIndex;

          return (
            <div key={s.step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-sm shadow-emerald-500/30"
                      : isCurrent
                      ? "bg-gold-gradient text-navy-950 font-black shadow-lg shadow-amber-500/40 scale-110 ring-2 ring-amber-400/40"
                      : "bg-navy-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3.5]" /> : stepNum}
                </div>
                <span
                  className={`text-[9px] mt-1 font-semibold tracking-tight truncate max-w-[48px] text-center transition-colors ${
                    isCurrent ? "text-amber-300 font-bold" : isCompleted ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {idx < STEPS_CONFIG.length - 1 && (
                <div className="flex-1 mx-1.5 mb-3 h-0.5 relative overflow-hidden rounded-full bg-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stepNum < currentIndex
                        ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                        : isCurrent
                        ? "bg-gradient-to-r from-amber-400 to-slate-800"
                        : "bg-slate-800"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

