import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Globe,
  KeyRound,
  FileText,
  Users,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { AdminUser } from "../../types";
import { adminLoginApi } from "../../services/api";

interface AdminLoginPageProps {
  onLoginSuccess: (admin: AdminUser) => void;
  onReturnToCustomerApp: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onReturnToCustomerApp,
}) => {
  const [username, setUsername] = useState("admin@savrdhfinancialservices.com");
  const [password, setPassword] = useState("Savrdh@Admin2026");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await adminLoginApi({ username, password });
    setIsLoading(false);

    if (res.success && res.admin) {
      localStorage.setItem("SAVRDH_ADMIN_TOKEN", res.admin.token);
      localStorage.setItem("SAVRDH_ADMIN_USER", JSON.stringify(res.admin));
      onLoginSuccess(res.admin);
    } else {
      setErrorMsg(res.message || "Invalid Admin credentials. Please check your username and password.");
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  const handleCopyLink = () => {
    const adminUrl = `${window.location.origin}${window.location.pathname}?page=admin`;
    navigator.clipboard.writeText(adminUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#040812] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-navy-950 font-sans relative overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800/60 bg-[#060B18]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">SAVRDH FINANCIAL SERVICES</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Staff CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Corporate Portal • CIN: U67100UP2021PTC156235</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToCustomerApp}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-navy-900/90 hover:bg-navy-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Go to Customer App</span>
          </button>
        </div>
      </header>

      {/* Main Center Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          {/* Card Frame */}
          <div className="bg-[#090F20] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden backdrop-blur-xl">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

            {/* Header / Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Admin & Legal CRM Login</h2>
              <p className="text-xs text-slate-400 mt-1">
                Authorized access for underwriters, legal panel advocates, and operations
              </p>
            </div>

            {/* Verified Official Credentials Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-navy-950/90 border border-amber-500/25 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Official Login Credentials
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-semibold">
                  Pre-configured
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono bg-black/50 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500 font-sans text-[11px]">Primary ID:</span>
                  <span className="text-amber-200 font-semibold">admin@savrdhfinancialservices.com</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500 font-sans text-[11px]">Password:</span>
                  <span className="text-emerald-300 font-bold">Savrdh@Admin2026</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin@savrdhfinancialservices.com", "Savrdh@Admin2026")}
                  className="py-1.5 px-2.5 text-[11px] font-bold rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <span>Autofill Primary Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("savrdhcapital@gmail.com", "Savrdh@Admin2026")}
                  className="py-1.5 px-2.5 text-[11px] font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-1"
                >
                  <span>Autofill Director Login</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Email / Staff ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@savrdhfinancialservices.com"
                    className="w-full pl-10 pr-4 py-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Master Password
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Savrdh@Admin2026</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-navy-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Savrdh CRM Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Direct Link Share & Quick Actions */}
            <div className="mt-6 pt-5 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto py-1.5 px-3 rounded-lg bg-navy-950 border border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">CRM URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Copy Direct CRM Login Link</span>
                  </>
                )}
              </button>

              <button
                onClick={onReturnToCustomerApp}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Switch to Customer Journey</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* CRM Quick Modules Summary */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-center text-[11px] text-slate-400">
            <div className="p-2.5 rounded-xl bg-navy-950/60 border border-slate-800/80">
              <Users className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="font-semibold text-slate-300 block">Lead Pipeline</span>
              <span>Live KYC & PAN</span>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-950/60 border border-slate-800/80">
              <FileText className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="font-semibold text-slate-300 block">CIBIL & LOA</span>
              <span>Bureau Extracts</span>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-950/60 border border-slate-800/80">
              <Briefcase className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="font-semibold text-slate-300 block">Advocate Desk</span>
              <span>Bank Notices & OTS</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-slate-800/60 bg-[#060B18]/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Savrdh Financial Services Pvt. Ltd. • All Rights Reserved</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Official Helpline: +91 8109995906</span>
          <span>•</span>
          <span className="text-amber-300 font-mono">support@savrdhfinancialservices.com</span>
        </div>
      </footer>
    </div>
  );
};
