import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, ShieldCheck, Award, Zap, HelpCircle } from "lucide-react";
import { ResolutionPackage, AICreditAnalysis } from "../../types";
import { RESOLUTION_PACKAGES } from "../../data/mockData";

interface Step6Props {
  analysis: AICreditAnalysis;
  onSelectPackage: (pkg: ResolutionPackage) => void;
  selectedPackage?: ResolutionPackage;
}

export const Step6Pricing: React.FC<Step6Props> = ({
  analysis,
  onSelectPackage,
  selectedPackage = RESOLUTION_PACKAGES[1], // default to Most Popular (Comprehensive)
}) => {
  const [selected, setSelected] = useState<ResolutionPackage>(selectedPackage);

  const handleProceed = () => {
    onSelectPackage(selected);
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 6 of 8: Resolution Pricing</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Select Resolution Package</h2>
        <p className="text-xs text-slate-400 mt-1">
          Fixed, transparent legal resolution fee. No hidden commissions.
        </p>
      </div>

      {/* Package Cards */}
      <div className="space-y-3.5">
        {RESOLUTION_PACKAGES.map((pkg) => {
          const isSelected = selected.id === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelected(pkg)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-navy-800/90 border-amber-500 shadow-xl shadow-amber-500/15 ring-1 ring-amber-500/40"
                  : "bg-navy-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      pkg.isPopular
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 shadow-sm"
                        : "bg-navy-900 border border-slate-700 text-slate-300"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Duration: {pkg.duration}
                  </span>
                </div>
              )}

              {/* Title & Price */}
              <div className="flex items-baseline justify-between mt-1">
                <h3 className="text-sm font-bold text-slate-100">{pkg.title}</h3>
                <div className="text-right">
                  <span className="text-xs text-slate-500 line-through mr-1.5 font-mono">
                    ₹{pkg.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-lg font-extrabold text-amber-400 font-mono">
                    ₹{pkg.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-amber-200/80 font-medium mt-1">
                Best for: {pkg.recommendedFor}
              </p>

              {/* Features List */}
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                {pkg.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Selection Checkmark */}
              <div className="mt-4 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>GST Invoice & Money-Back Terms</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-amber-500 text-navy-950"
                      : "border border-slate-600 bg-navy-900"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div className="mt-4 p-3 rounded-xl bg-navy-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <Award className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <span>
          Payment initiates immediate CRM lead ingestion and assigns your dedicated Legal Resolution Advocate within 60 seconds.
        </span>
      </div>

      {/* Action Button */}
      <button
        id="btn-proceed-payment"
        type="button"
        onClick={handleProceed}
        className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
      >
        <span>Proceed to Pay ₹{selected.price.toLocaleString()}</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
