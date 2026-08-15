import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowRight, Fingerprint, Lock, CheckCircle2, Award, Scale, BarChart3, Users, Sparkles, TrendingUp, Landmark } from "lucide-react";
import { BrandLogo } from "../common/BrandLogo";

interface Step1Props {
  onGetStarted: () => void;
  onBiometricLogin: () => void;
}

export const Step1SplashWelcome: React.FC<Step1Props> = ({ onGetStarted, onBiometricLogin }) => {
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
            <div className="w-full h-full rounded-[22px] bg-navy-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gold-subtle" />
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
          CIN: U67100UP2021PTC156235 • Greater Noida, Uttar Pradesh
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
      {/* Top Luxury Header */}
      <div className="flex items-center justify-between pt-1">
        <BrandLogo size="md" />
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold shadow-sm shadow-amber-500/10">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>RBI Legal Framework</span>
        </div>
      </div>

      {/* Main Luxury Hero Card */}
      <div className="my-5">
        <div className="p-5 rounded-3xl navy-card-vip relative overflow-hidden">
          {/* Subtle Golden Glow Orbs */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-950/80 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-3.5 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Certified Credit Resolution Portal</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-100 leading-tight">
            Restoring Financial Dignity with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">Legal Debt Defense</span>
          </h2>
          
          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            Eliminate harassment, settle unserviceable loans legally, correct Bureau discrepancies, and rebuild your CIBIL score with institutional legal advocates.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60">
            <div className="text-center p-2 rounded-xl bg-navy-950/70 border border-slate-800">
              <span className="block text-sm font-extrabold text-amber-300">₹18.4 Cr+</span>
              <span className="text-[9px] text-slate-400 font-medium">Debt Resolved</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-navy-950/70 border border-slate-800">
              <span className="block text-sm font-extrabold text-emerald-400">98.4%</span>
              <span className="text-[9px] text-slate-400 font-medium">Success Rate</span>
            </div>
            <div className="text-center p-2 rounded-xl bg-navy-950/70 border border-slate-800">
              <span className="block text-sm font-extrabold text-sky-400">4 Bureaus</span>
              <span className="text-[9px] text-slate-400 font-medium">Integrated</span>
            </div>
          </div>

          {/* Key Value Points */}
          <div className="grid grid-cols-1 gap-2.5 mt-4">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-navy-950/80 border border-slate-800/80 hover:border-amber-500/30 transition-colors">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Paperless Digital eKYC</p>
                <p className="text-[11px] text-slate-400">Instant UIDAI Aadhaar & PAN authentication with zero paperwork.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-navy-950/80 border border-slate-800/80 hover:border-amber-500/30 transition-colors">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 mt-0.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">AI Deep Credit Diagnostic</p>
                <p className="text-[11px] text-slate-400">Pinpoints Written-off, Settled, and High-DPD accounts harming your score.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-navy-950/80 border border-slate-800/80 hover:border-amber-500/30 transition-colors">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Senior High Court Advocate Assignment</p>
                <p className="text-[11px] text-slate-400">Direct dedicated advocate assigned with automated CRM live tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Trust Badges */}
      <div className="space-y-3">
        <button
          id="btn-get-started"
          onClick={onGetStarted}
          className="w-full py-4 px-6 rounded-2xl bg-gold-gradient text-navy-950 font-extrabold text-sm tracking-wide shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Initiate Credit Resolution</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          id="btn-biometric-login"
          onClick={onBiometricLogin}
          className="w-full py-3.5 px-4 rounded-2xl bg-navy-900/90 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
        >
          <Fingerprint className="w-4 h-4 text-amber-400" />
          <span>Biometric / FaceID Express Login</span>
        </button>

        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-400">
          <span>Mon – Sat: 10 AM – 7 PM</span>
          <span>•</span>
          <a href="tel:+918109995906" className="text-amber-300 hover:underline font-bold">
            Support: +91 8109995906
          </a>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ISO 27001 Certified
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 100% Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Bar Council Registered
          </span>
        </div>
      </div>
    </div>
  );
};

