import React, { useState } from "react";
import { X, UserPlus, Sparkles, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { createManualLeadApi } from "../../services/api";

interface CreateManualLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

export const CreateManualLeadModal: React.FC<CreateManualLeadModalProps> = ({
  isOpen,
  onClose,
  onLeadCreated,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [creditScore, setCreditScore] = useState("580");
  const [totalDefaultAmount, setTotalDefaultAmount] = useState("350000");
  const [resolutionPackage, setResolutionPackage] = useState(
    "Comprehensive Debt Settlement & CIBIL Correction"
  );
  const [packageAmount, setPackageAmount] = useState("9999");
  const [caseStatus, setCaseStatus] = useState("Under Legal Review");
  const [assignedAdvisorName, setAssignedAdvisorName] = useState("Adv. Vikram Malhotra");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobile) {
      setErrorMsg("Customer name and 10-digit mobile are mandatory.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await createManualLeadApi({
      customerName,
      mobile,
      email,
      panNumber: panNumber.toUpperCase(),
      creditScore: Number(creditScore),
      totalDefaultAmount: Number(totalDefaultAmount),
      resolutionPackage,
      packageAmount: Number(packageAmount),
      caseStatus,
      assignedAdvisorName,
      notes,
    });

    setIsLoading(false);

    if (res.success) {
      onLeadCreated();
      onClose();
    } else {
      setErrorMsg(res.message || "Failed to create lead docket.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0A1120] border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 text-slate-100 overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Manual Client Lead Intake</h2>
            <p className="text-xs text-slate-400">Add walk-in, inbound helpline or referral client docket</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alok Verma"
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mobile Number (10 digits) *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">PAN Card Number</label>
              <input
                type="text"
                maxLength={10}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white uppercase font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estimated CIBIL Score</label>
              <input
                type="number"
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
                placeholder="580"
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Total Default / Overdue Amount (₹)</label>
              <input
                type="number"
                value={totalDefaultAmount}
                onChange={(e) => setTotalDefaultAmount(e.target.value)}
                placeholder="350000"
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Resolution Package</label>
              <select
                value={resolutionPackage}
                onChange={(e) => setResolutionPackage(e.target.value)}
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
              >
                <option value="Single Default / CIBIL Correction">Single Default / CIBIL Correction (₹4,999)</option>
                <option value="Comprehensive Debt Settlement & CIBIL Correction">Comprehensive Debt Settlement (₹9,999)</option>
                <option value="Executive Legal Representation & Fast-Track OTS">Executive Legal OTS (₹14,999)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Assigned Legal Counsel</label>
              <select
                value={assignedAdvisorName}
                onChange={(e) => setAssignedAdvisorName(e.target.value)}
                className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
              >
                <option value="Adv. Vikram Malhotra">Adv. Vikram Malhotra (Lead Counsel)</option>
                <option value="Adv. Sunita Rao">Adv. Sunita Rao (Banking Disputes)</option>
                <option value="Adv. Rohit Sen">Adv. Rohit Sen (OTS Specialist)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Initial Case Notes / Default Summary</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer has 2 written-off credit cards from HDFC & Axis. Received recovery notices..."
              className="w-full p-2.5 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none resize-none font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-navy-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? "Creating Lead..." : "Create Client Docket"}
          </button>
        </form>
      </div>
    </div>
  );
};
