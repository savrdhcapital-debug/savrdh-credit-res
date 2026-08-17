import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, Fingerprint, Lock, CheckCircle2, Award, Scale, BarChart3, Users } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";

interface Step1Props {
  onGetStarted: () => void;
  onBiometricLogin: () => void;
  onOpenAdminCRM?: () => void;
}

export const Step1SplashWelcome: React.FC<Step1Props> = ({ onGetStarted, onBiometricLogin, onOpenAdminCRM }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center bg-radial from-navy-900 via-navy-950 to-[#04070D]">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-1 shadow-2xl shadow-amber-500/30 animate-pulse">
            <div className="w-full h-full rounded-[22px] bg-navy-950 flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-wider text-slate-100 font-heading">
          SAVRDH
        </h1>
        <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mt-1">
          Financial Services Private Limited
        </p>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Financial Advisory & Credit Resolution Company
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          CIN: U67100UP2021PTC156235 • 01, GAUR YAMUNA CITY Greater Noida
        </p>

        {/* Loading Indicator */}
        <div className="w-48 h-1 bg-navy-800 rounded-full mt-10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ width: "80%" }}></div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-amber-500/80" /> 256-Bit Bank Grade Encryption
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-between p-5 pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <BrandLogo size="md" />
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>RBI Compliant</span>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="my-6">
        <div className="p-5 rounded-2xl navy-card-gold relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium mb-3">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Dedicated Customer App</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 leading-tight">
            Regain Financial Freedom with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Legal Credit Resolution</span>
          </h2>
          
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            Settle unmanageable loans, stop collection harassment, eliminate negative CIBIL marks, and restore your creditworthiness with Savrdh’s certified legal experts.
          </p>

          {/* Key Value Points */}
          <div className="grid grid-cols-1 gap-2.5 mt-5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-navy-950/60 border border-slate-800/70">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Aadhaar Digital eKYC</p>
                <p className="text-[11px] text-slate-400">Instant UIDAI identity verification in under 30 seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-navy-950/60 border border-slate-800/70">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">AI-Powered Bureau Audit</p>
                <p className="text-[11px] text-slate-400">Deep diagnostic of Written-off, Settled, and DPD default accounts.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-navy-950/60 border border-slate-800/70">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Dedicated Advocate & CRM Sync</p>
                <p className="text-[11px] text-slate-400">Direct 1-on-1 advisor assignment with automatic CRM case tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Biometrics */}
      <div className="space-y-3">
        <button
          id="btn-get-started"
          onClick={onGetStarted}
          className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Get Started with Credit Resolution</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          id="btn-biometric-login"
          onClick={onBiometricLogin}
          className="w-full py-3 px-4 rounded-xl bg-navy-800/80 border border-slate-700/60 hover:border-amber-500/40 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Fingerprint className="w-4 h-4 text-amber-400" />
          <span>Quick Unlock with Biometrics / Face ID</span>
        </button>

        {onOpenAdminCRM && (
          <button
            id="btn-staff-crm-login"
            onClick={onOpenAdminCRM}
            className="w-full py-2.5 px-4 rounded-xl bg-navy-950/80 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff & Legal CRM Portal Login</span>
          </button>
        )}

        <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-slate-400">
          <span>Mon – Sat: 10 AM – 7 PM</span>
          <span>•</span>
          <a href="tel:+918109995906" className="text-amber-400 hover:underline font-medium">
            Support: +91 8109995906
          </a>
        </div>

        <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ISO 27001
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Confidential
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Bar Council Advocates
          </span>
        </div>
      </div>
    </div>
  );
};
