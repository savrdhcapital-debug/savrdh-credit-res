import React, { useState, useEffect } from "react";
import { User, Phone, Mail, ArrowRight, ShieldCheck, CheckCircle2, KeyRound, Sparkles, RefreshCw, Send, Radio } from "lucide-react";
import { UserProfile } from "../../types";
import { sendAuthOtp, verifyAuthOtp, getSmsConfigStatus } from "../../services/api";

interface Step2Props {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export const Step2Registration: React.FC<Step2Props> = ({ onComplete, initialProfile }) => {
  const [fullName, setFullName] = useState(initialProfile?.fullName || "Rajeshwar Sharma");
  const [mobile, setMobile] = useState(initialProfile?.mobile || "9820491823");
  const [email, setEmail] = useState(initialProfile?.email || "rajeshwar.sharma@example.com");

  const [otpSent, setOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [previewCode, setPreviewCode] = useState<{ mobile?: string; email?: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [smsGatewayStatus, setSmsGatewayStatus] = useState<{ isConfigured: boolean; activeProvider: string; message: string } | null>(null);

  useEffect(() => {
    getSmsConfigStatus().then(setSmsGatewayStatus).catch(() => null);
  }, []);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full legal name as per PAN.");
      return;
    }
    if (mobile.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await sendAuthOtp({
        mobile: mobile.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
      });

      if (res.success) {
        setOtpSent(true);
        setResendTimer(30);
        setSuccessMsg(res.message || `OTP dispatched to +91 ${mobile.slice(-10)}`);
        setPreviewCode({
          mobile: res.previewMobileOtp,
          email: res.previewEmailOtp,
        });
      } else {
        setErrorMsg(res.message || "Failed to dispatch OTP");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to communicate with OTP service.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAutoFillOtp = () => {
    if (previewCode?.mobile) {
      setMobileOtp(previewCode.mobile);
    } else {
      setMobileOtp("7492");
    }
    if (previewCode?.email) {
      setEmailOtp(previewCode.email);
    } else {
      setEmailOtp("3816");
    }
    setErrorMsg("");
  };

  const handleVerifyAndRegister = async () => {
    if (mobileOtp.length < 4) {
      setErrorMsg("Please enter the 4-digit Mobile SMS OTP.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await verifyAuthOtp({
        mobile: mobile.trim(),
        mobileOtp: mobileOtp.trim(),
        emailOtp: emailOtp.trim() || undefined,
      });

      if (res.success) {
        const profile: UserProfile = {
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          isMobileVerified: true,
          isEmailVerified: true,
          authToken: res.authToken || `jwt_svr_${Date.now()}`,
          biometricEnabled: true,
        };
        onComplete(profile);
      } else {
        setErrorMsg(res.message || "Invalid OTP entered.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "OTP verification failed. Please check the code.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {/* Title */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Step 2 of 8: Customer Registration & OTP</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Create Customer Account</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your registered details to verify your phone via real-time SMS OTP and begin your case.
        </p>

        {/* SMS Gateway Status Banner */}
        {smsGatewayStatus && (
          <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-navy-950/90 border border-slate-800 text-[10px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Radio className={`w-3 h-3 ${smsGatewayStatus.isConfigured ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
              <span>SMS Route: <strong className="text-slate-200">{smsGatewayStatus.activeProvider}</strong></span>
            </span>
            <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded ${smsGatewayStatus.isConfigured ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-300 border border-amber-500/20"}`}>
              {smsGatewayStatus.isConfigured ? "LIVE GATEWAY" : "OTP ACTIVE"}
            </span>
          </div>
        )}
      </div>

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name (as per PAN Card) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajeshwar Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number (for SMS OTP Verification) *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-slate-400 text-xs font-semibold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91</span>
                </div>
                <input
                  id="input-mobile"
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="w-full pl-16 pr-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajeshwar.sharma@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <span>
              We will send a high-priority verification SMS OTP to your registered phone number (+91 {mobile || "..."}).
            </span>
          </div>

          <button
            id="btn-send-otp"
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Sending Real SMS OTP...</span>
              </>
            ) : (
              <>
                <span>Send SMS Verification OTP</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Enter Received OTP</span>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Edit Mobile Number
              </button>
            </div>

            {/* Success Message / Info */}
            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Mobile OTP */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  SMS OTP sent to +91 {mobile}
                </label>
                {previewCode?.mobile && (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    OTP: {previewCode.mobile}
                  </span>
                )}
              </div>
              <input
                id="input-mobile-otp"
                type="text"
                maxLength={6}
                value={mobileOtp}
                onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter SMS OTP"
                className="w-full px-4 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-center text-lg tracking-widest font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Email OTP */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Email OTP sent to {email}
                </label>
                {previewCode?.email && (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    OTP: {previewCode.email}
                  </span>
                )}
              </div>
              <input
                id="input-email-otp"
                type="text"
                maxLength={6}
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter Email OTP"
                className="w-full px-4 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-center text-lg tracking-widest font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Resend & Fast Fill Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                disabled={resendTimer > 0 || isSending}
                onClick={() => handleSendOtp()}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 disabled:text-slate-500 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend SMS OTP"}</span>
              </button>

              {previewCode?.mobile && (
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-2.5 py-1 rounded-lg bg-navy-800 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Auto-Fill</span>
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            id="btn-verify-account"
            type="button"
            disabled={isVerifying}
            onClick={handleVerifyAndRegister}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Verifying SMS OTP & Creating Account...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Verify OTP & Proceed to KYC</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

