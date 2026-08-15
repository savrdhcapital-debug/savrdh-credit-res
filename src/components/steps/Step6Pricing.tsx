import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, ShieldCheck, Award, Zap, HelpCircle, Lock } from "lucide-react";
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Step 6 of 8: Resolution Retainer Plans</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-100">Select Resolution Retainer</h2>
        <p className="text-xs text-slate-400 mt-1">
          Fixed, transparent legal resolution fee. Zero commission on negotiated debt reductions.
        </p>
      </div>

      {/* Package Cards */}
      <div className="space-y-4">
        {RESOLUTION_PACKAGES.map((pkg) => {
          const isSelected = selected.id === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelected(pkg)}
              className={`p-4.5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "navy-card-vip ring-2 ring-amber-400/80 shadow-2xl shadow-amber-500/20 scale-[1.01]"
                  : "navy-card border-slate-800/80 hover:border-slate-700 hover:bg-navy-900/60"
              }`}
            >
              {/* Badge */}
              {pkg.badge ? (
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      pkg.isPopular
                        ? "bg-gold-gradient text-navy-950 shadow-md shadow-amber-500/30"
                        : "bg-navy-950 border border-amber-500/40 text-amber-300 font-bold"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                  <span className="text-[11px] text-slate-300 font-bold bg-navy-950/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                    Duration: {pkg.duration}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Standard Retainer
                  </span>
                  <span className="text-[11px] text-slate-300 font-bold bg-navy-950/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                    Duration: {pkg.duration}
                  </span>
                </div>
              )}

              {/* Title & Price */}
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">{pkg.title}</h3>
                  <p className="text-[11px] text-amber-300/90 font-medium mt-0.5">
                    Best for: {pkg.recommendedFor}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 line-through mr-1.5 font-mono">
                    ₹{pkg.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                    ₹{pkg.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 space-y-2">
                {pkg.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                    <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Selection Checkmark */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>GST Tax Invoice Included</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-amber-400 text-navy-950 shadow-sm"
                      : "border border-slate-600 bg-navy-950"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security note */}
      <div className="mt-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
        <Award className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-bold text-amber-300">Savrdh Resolution Protection:</span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            All legal petitions are executed under direct Bar Council advocate supervision with automated CRM tracking.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 space-y-2">
        <button
          id="btn-proceed-payment"
          type="button"
          onClick={handleProceed}
          className="w-full py-4 px-6 rounded-2xl bg-gold-gradient text-navy-950 font-extrabold text-sm tracking-wide shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed with {selected.title} (₹{selected.price.toLocaleString()})</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
          <Lock className="w-3 h-3 text-amber-400" />
          <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
        </p>
      </div>
    </div>
  );
};

