import React, { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Phone, RefreshCw, ShieldCheck, User } from "lucide-react";
import { UserProfile } from "../../types";
import { getSmsConfigStatus, sendAuthOtp, verifyAuthOtp } from "../../services/api";

interface Step2Props {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

export const Step2Registration: React.FC<Step2Props> = ({ onComplete, initialProfile }) => {
  const [fullName, setFullName] = useState(initialProfile?.fullName || "");
  const [mobile, setMobile] = useState(initialProfile?.mobile || "");
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [smsStatus, setSmsStatus] = useState<{ isConfigured: boolean; activeProvider: string; message: string } | null>(null);

  useEffect(() => {
    getSmsConfigStatus().then(setSmsStatus).catch(() => null);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim()) return setErrorMsg("Please enter your full legal name.");
    if (!/^\d{10}$/.test(mobile)) return setErrorMsg("Please enter a valid 10-digit mobile number.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErrorMsg("Please enter a valid email address.");

    setIsSending(true);
    try {
      const res = await sendAuthOtp({ mobile, email, fullName: fullName.trim() });
      if (!res.success) throw new Error(res.message || "OTP could not be sent");
      setOtpSent(true);
      setSuccessMsg(res.message || "OTP sent successfully.");
    } catch (err: any) {
      setErrorMsg(err?.message || "OTP service is currently unavailable.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    setErrorMsg("");
    if (mobileOtp.trim().length < 4) return setErrorMsg("Please enter the OTP received on your mobile.");

    setIsVerifying(true);
    try {
      const res = await verifyAuthOtp({ mobile, mobileOtp: mobileOtp.trim() });
      if (!res.success) throw new Error(res.message || "OTP verification failed");
      onComplete({
        fullName: fullName.trim(),
        mobile,
        email: email.trim().toLowerCase(),
        isMobileVerified: true,
        isEmailVerified: false,
        authToken: res.authToken,
        biometricEnabled: false,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "OTP verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-5">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Step 2 of 8: Registration
        </div>
        <h2 className="text-xl font-bold text-slate-100">Create your SAVRDH account</h2>
        <p className="text-xs text-slate-400 mt-1">Enter your own details. No demo customer information is pre-filled.</p>
      </div>

      {smsStatus && !smsStatus.isConfigured && (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200">
          Live SMS gateway is not configured on this deployment. OTP verification will remain unavailable until an SMS provider is configured.
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-4">
            <label className="block text-xs font-semibold text-slate-300">
              Full Name *
              <div className="relative mt-1.5">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Name as per PAN" className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-sm text-slate-100" required />
              </div>
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              Mobile Number *
              <div className="relative mt-1.5">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric" className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-sm text-slate-100" required />
              </div>
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              Email Address *
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-sm text-slate-100" required />
              </div>
            </label>
          </div>
          <button disabled={isSending} className="w-full py-3.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {isSending ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 text-xs"><CheckCircle2 className="w-4 h-4" />{successMsg || "OTP sent."}</div>
            <label className="block text-xs font-semibold text-slate-300">Mobile OTP
              <input value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Enter OTP" className="mt-1.5 w-full px-4 py-3 rounded-xl bg-navy-950 border border-slate-700 text-center tracking-[0.35em] text-slate-100" />
            </label>
          </div>
          <button onClick={handleVerify} disabled={isVerifying} className="w-full py-3.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm disabled:opacity-60">
            {isVerifying ? "Verifying..." : "Verify & Continue"}
          </button>
          <button onClick={() => { setOtpSent(false); setMobileOtp(""); }} className="w-full text-xs text-slate-400 hover:text-amber-300">Change details</button>
        </div>
      )}

      {errorMsg && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{errorMsg}</div>}
    </div>
  );
};
