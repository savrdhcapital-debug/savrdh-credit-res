import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, RefreshCw, CreditCard, Lock, Sparkles, Building2, MapPin, Calendar, User, ArrowRight } from "lucide-react";
import { KYCData, UserProfile } from "../../types";

interface Step3Props {
  userProfile: UserProfile;
  onComplete: (kycData: KYCData) => void;
  initialKYC?: KYCData;
}

export const Step3DigitalKYC: React.FC<Step3Props> = ({ userProfile, onComplete, initialKYC }) => {
  const [aadhaarRaw, setAadhaarRaw] = useState("582948199283");
  const [panNumber, setPanNumber] = useState(initialKYC?.panNumber || "ABCDE1234F");
  
  const [stage, setStage] = useState<"INPUT" | "OTP_SENT" | "VERIFIED">(
    initialKYC?.isVerified ? "VERIFIED" : "INPUT"
  );
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [verifiedProfile, setVerifiedProfile] = useState(
    initialKYC?.fetchedProfile || {
      name: userProfile.fullName || "Rajeshwar Sharma",
      dob: "14 Jun 1988",
      gender: "Male",
      fatherName: "Devendra Sharma",
      address: "Flat 402, B-Wing, Royal Palms Residency, Aarey Milk Colony, Goregaon East, Mumbai, Maharashtra - 400065",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    }
  );

  const formatAadhaar = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarRaw(raw);
  };

  const handleRequestAadhaarOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarRaw.length !== 12) {
      setErrorMsg("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    if (panNumber.length !== 10) {
      setErrorMsg("Please enter a valid 10-character PAN Number (e.g. ABCDE1234F).");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsProcessing(false);
      setStage("OTP_SENT");
    }, 1200);
  };

  const handleVerifyAadhaarOtp = () => {
    if (aadhaarOtp.length < 4) {
      setErrorMsg("Please enter the 6-digit Aadhaar OTP.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsProcessing(false);
      setStage("VERIFIED");
    }, 1400);
  };

  const handleConfirmAndProceed = () => {
    const kycResult: KYCData = {
      aadhaarNumber: aadhaarRaw,
      maskedAadhaar: `XXXX-XXXX-${aadhaarRaw.slice(-4)}`,
      panNumber: panNumber.toUpperCase(),
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      kycProvider: "UIDAI eKYC Gateway via NSDL Protean",
      referenceId: `EKYC-UID-${Math.floor(10000000 + Math.random() * 90000000)}`,
      fetchedProfile: verifiedProfile,
    };
    onComplete(kycResult);
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {/* Step Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Step 3 of 8: Digital eKYC Verification</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Paperless UIDAI eKYC</h2>
        <p className="text-xs text-slate-400 mt-1">
          Authenticate your identity securely via UIDAI OTP and verify your PAN record.
        </p>
      </div>

      {stage === "INPUT" && (
        <form onSubmit={handleRequestAadhaarOtp} className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-4">
            {/* Aadhaar Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  12-Digit Aadhaar Number *
                </label>
                <span className="text-[10px] text-slate-400">UIDAI Encrypted</span>
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-aadhaar"
                  type="text"
                  value={formatAadhaar(aadhaarRaw)}
                  onChange={handleAadhaarChange}
                  placeholder="5829 4819 9283"
                  className="w-full pl-10 pr-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-sm font-mono tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* PAN Card Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Permanent Account Number (PAN) *
                </label>
                <span className="text-[10px] text-slate-400">Income Tax Dept</span>
              </div>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-pan"
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full pl-10 pr-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-sm font-mono tracking-wider text-slate-100 placeholder-slate-600 focus:outline-none uppercase"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>UIDAI Consent & Data Privacy</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                By clicking proceed, you authorize Savrdh Financial Services Pvt. Ltd. to query UIDAI and Credit Information Companies (CIBIL/Experian) to retrieve your KYC and Credit History for debt resolution purposes.
              </p>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            id="btn-request-aadhaar-otp"
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Connecting to UIDAI Provider...</span>
              </>
            ) : (
              <>
                <span>Send Aadhaar OTP</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      )}

      {stage === "OTP_SENT" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-4">
            <div className="text-center pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Aadhaar eKYC Authentication
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                OTP sent to Aadhaar-linked mobile: <strong className="text-amber-400">******{userProfile.mobile.slice(-4) || "1823"}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter 6-Digit UIDAI OTP
              </label>
              <input
                id="input-aadhaar-otp"
                type="text"
                maxLength={6}
                value={aadhaarOtp}
                onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit Aadhaar OTP"
                className="w-full px-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-center text-lg tracking-widest font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setAadhaarOtp("849201")}
              className="w-full py-2 px-3 rounded-lg bg-navy-800 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Fill Aadhaar OTP (849201)</span>
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            id="btn-verify-aadhaar-otp"
            type="button"
            disabled={isProcessing}
            onClick={handleVerifyAadhaarOtp}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Fetching UIDAI Verified Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Verify Aadhaar & Fetch KYC Profile</span>
              </>
            )}
          </button>
        </div>
      )}

      {stage === "VERIFIED" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl navy-card-gold space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">UIDAI eKYC Verified</h3>
                  <p className="text-[10px] text-emerald-400 font-medium">Digital Identity Authenticated</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-900 border border-slate-700 text-slate-400">
                NSDL-OK
              </span>
            </div>

            {/* Fetched Profile Card */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-navy-950/80 border border-slate-800">
              <img
                src={verifiedProfile.photoUrl}
                alt="Aadhaar Verified Photo"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
              />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                  <span>{verifiedProfile.name}</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    PAN Match
                  </span>
                </div>
                <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>DOB: {verifiedProfile.dob} ({verifiedProfile.gender})</span>
                </div>
                <div className="text-slate-400 flex items-start gap-1 text-[11px] leading-tight">
                  <MapPin className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{verifiedProfile.address}</span>
                </div>
              </div>
            </div>

            {/* Verified Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-navy-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Aadhaar (Masked)</span>
                <span className="font-mono text-slate-200 font-medium">
                  XXXX-XXXX-{aadhaarRaw.slice(-4)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">PAN Status</span>
                <span className="font-mono text-emerald-400 font-medium">{panNumber} (Active)</span>
              </div>
            </div>
          </div>

          <button
            id="btn-proceed-credit-report"
            type="button"
            onClick={handleConfirmAndProceed}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Fetch Credit Report</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
