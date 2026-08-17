import React, { useState } from "react";
import {
  ShieldAlert,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";
import { AdminUser } from "../../types";
import { adminLoginApi } from "../../services/api";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState("admin@savrdhfinancialservices.com");
  const [password, setPassword] = useState("Savrdh@Admin2026");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
      onClose();
    } else {
      setErrorMsg(res.message || "Invalid Admin credentials.");
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0A1120] border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 text-slate-100 overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">SAVRDH ADMIN CRM</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-slate-400">Central Lead & Case Management Portal</p>
          </div>
        </div>

        {/* Official Credentials Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-navy-900/90 border border-amber-500/20 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Official Admin Access Credentials
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-300 bg-black/40 p-2.5 rounded-xl font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Login ID:</span>
              <span className="text-amber-200 font-bold">admin@savrdhfinancialservices.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Master Password:</span>
              <span className="text-emerald-300 font-bold">Savrdh@Admin2026</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@savrdhfinancialservices.com", "Savrdh@Admin2026")}
              className="flex-1 py-1 px-2 text-[10px] font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
            >
              Autofill Primary Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("savrdhcapital@gmail.com", "Savrdh@Admin2026")}
              className="flex-1 py-1 px-2 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Autofill Director ID
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Username / Email ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@savrdhfinancialservices.com"
                className="w-full pl-10 pr-4 py-2.5 bg-navy-950/90 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-navy-950/90 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Access CRM Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <Building2 className="w-3 h-3 text-amber-400/70" />
          <span>Savrdh Financial Services Pvt. Ltd. • Secured CRM Gateway</span>
        </div>
      </div>
    </div>
  );
};
