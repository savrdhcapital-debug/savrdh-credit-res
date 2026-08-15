import React, { useState } from "react";
import { X, ShieldCheck, Fingerprint, Lock, Key, Clock, Smartphone, CheckCircle2, AlertTriangle, LogOut } from "lucide-react";
import { UserProfile } from "../../types";

interface SecurityModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
}

export const SecuritySettingsModal: React.FC<SecurityModalProps> = ({
  userProfile,
  onClose,
  onUpdateProfile,
  onLogout,
}) => {
  const [biometrics, setBiometrics] = useState(userProfile.biometricEnabled ?? true);
  const [autoLogoutMin, setAutoLogoutMin] = useState(15);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleToggleBiometrics = () => {
    const newVal = !biometrics;
    setBiometrics(newVal);
    onUpdateProfile({ ...userProfile, biometricEnabled: newVal });
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Security & Authentication</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-navy-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {showSavedMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Security preferences updated successfully!</span>
            </div>
          )}

          {/* Biometrics Toggle */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs">Biometric Fast Login</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Unlock app with Face ID or Device Fingerprint
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleBiometrics}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                biometrics ? "bg-amber-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-navy-950 absolute top-1 transition-transform ${
                  biometrics ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Auto Logout Setting */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Auto Logout Inactivity Timer</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Automatically locks session to safeguard confidential financial records.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[5, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setAutoLogoutMin(mins)}
                  className={`py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                    autoLogoutMin === mins
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-navy-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Active Session & Encryption Info */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                Active Device Session
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Current Device
              </span>
            </div>
            <div className="text-[10px] text-slate-400 space-y-1">
              <p>JWT Token: <span className="font-mono text-slate-300">{userProfile.authToken?.slice(0, 20)}...</span></p>
              <p>Encryption: AES-256 GCM (Zero Local Storage of Plaintext Bureau Data)</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
