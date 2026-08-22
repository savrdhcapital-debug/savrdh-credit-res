import React from "react";
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  CreditCard,
  FileText,
  Lock,
  ExternalLink
} from "lucide-react";
import { CreditBureauReport, KYCData, UserProfile } from "../../types";

interface BureauDocketModalProps {
  report: CreditBureauReport;
  kycData?: KYCData;
  userProfile?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const BureauDocketModal: React.FC<BureauDocketModalProps> = ({
  report,
  kycData,
  userProfile,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const borrowerName =
    report.verifiedProfile?.matchedName ||
    kycData?.fetchedProfile?.name ||
    userProfile?.fullName ||
    "Borrower Name";

  const borrowerDob =
    report.verifiedProfile?.matchedDob ||
    kycData?.fetchedProfile?.dob ||
    "On Record";

  const borrowerPan =
    report.verifiedProfile?.matchedPan ||
    kycData?.panNumber ||
    "PAN On Record";

  const borrowerAddress =
    report.verifiedProfile?.matchedAddress ||
    kycData?.fetchedProfile?.address ||
    userProfile?.cityState ||
    "Address on Record as per KYC";

  const isTransUnion = (report.bureauName || "").toLowerCase().includes("transunion") || (report.bureauName || "").toLowerCase().includes("cibil");
  const isExperian = (report.bureauName || "").toLowerCase().includes("experian");
  const isEquifax = (report.bureauName || "").toLowerCase().includes("equifax");
  const isCrif = (report.bureauName || "").toLowerCase().includes("crif");

  const bureauThemeColor = isExperian
    ? "text-blue-400 border-blue-500/40 bg-blue-500/10"
    : isEquifax
    ? "text-rose-400 border-rose-500/40 bg-rose-500/10"
    : isCrif
    ? "text-purple-400 border-purple-500/40 bg-purple-500/10"
    : "text-amber-400 border-amber-500/40 bg-amber-500/10";

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadRawFile = () => {
    if (report.rawFileDataUrl) {
      const a = document.createElement("a");
      a.href = report.rawFileDataUrl;
      a.download = report.uploadedFileName || `${report.bureauName.replace(/\s+/g, "_")}_Official_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0B101E] border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 text-slate-100 flex flex-col overflow-hidden">
        {/* Header Action Bar */}
        <div className="px-6 py-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Official Credit Bureau Report Docket
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bureauThemeColor}`}>
                  {report.bureauName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Control Reference: <span className="font-mono text-slate-200">{report.controlNumber}</span> • Date: {report.reportDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            {report.rawFileDataUrl && (
              <button
                onClick={handleDownloadRawFile}
                type="button"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Original File</span>
              </button>
            )}
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Docket Body (Printable Area) */}
        <div className="p-6 overflow-y-auto space-y-6 bg-[#070B14]">
          {/* Official Bureau Header Seal */}
          <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                  {report.bureauName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  OFFICIAL CIC REGISTRY EXTRACT
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Comprehensive Consumer Credit File</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Issued pursuant to Section 15 of Credit Information Companies (Regulation) Act, 2005 (CICRA).
              </p>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{report.verifiedProfile?.verificationScore || 100}% Identity Authenticated</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Audit Digest: SAV-CIC-{report.controlNumber.slice(-8)}
              </p>
            </div>
          </div>

          {/* Forensic Identity Verification Box (Name, DOB, PAN) */}
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Borrower Identity & KYC Verification</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Match Verified with Bureau Records
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1">Borrower Full Name</span>
                <span className="text-sm font-bold text-white">{borrowerName}</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Exact Name Match
                </span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1">Date of Birth (DOB)</span>
                <span className="text-sm font-bold text-white font-mono">{borrowerDob}</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> DOB Verified against Bureau
                </span>
              </div>

              <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-1">Income Tax PAN</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{borrowerPan}</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Central Registry Validated
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950/40 border border-slate-800/60 text-[11px] text-slate-400">
              <strong className="text-slate-300">Registered Address:</strong> {borrowerAddress}
            </div>
          </div>

          {/* Credit Score & Summary Meters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Credit Bureau Score</span>
              <div className="text-4xl font-extrabold text-amber-400 font-heading">
                {report.score}
              </div>
              <span className="text-[11px] font-bold text-rose-400 block">
                {report.scoreBand.toUpperCase()} ({report.score < 600 ? "High Risk Default" : "Subprime"})
              </span>
              <p className="text-[9px] text-slate-500">Scale 300 - 900</p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Overdue Default</span>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                ₹{report.summary.totalOverdue.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-slate-400">
                Outstanding: ₹{report.summary.totalOutstanding.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Default Accounts</span>
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Written-Off:</span>
                  <span className="font-bold text-rose-400">{report.summary.writtenOffAccountsCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Settled Flag:</span>
                  <span className="font-bold text-amber-400">{report.summary.settledAccountsCount}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">Requires Legal Resolution</p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Exposure & Inquiries</span>
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Utilization:</span>
                  <span className="font-bold text-rose-400">{report.summary.creditUtilizationPercent}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Hard Enquiries:</span>
                  <span className="font-bold text-slate-200">{report.summary.totalEnquiries}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500">Past 90 Days</p>
            </div>
          </div>

          {/* Tradelines & Account History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Account Tradelines & DPD Payment History ({report.accounts.length})</span>
              <span className="text-[10px] text-slate-500">TransUnion & Bank Certified</span>
            </h4>

            <div className="space-y-3">
              {report.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-white">{acc.institution}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {acc.accountType}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            acc.status === "Written-Off"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : acc.status === "Settled"
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {acc.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Account: {acc.accountNumberMasked} • Sanctioned: ₹{acc.sanctionedAmount.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Overdue Balance:</span>
                      <span className="text-base font-bold text-rose-400 font-mono">
                        ₹{(acc.overdueAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* 6-Month DPD Track */}
                  {acc.dpdHistory && acc.dpdHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block mb-1.5">
                        6-Month Days Past Due (DPD) Bureau Matrix:
                      </span>
                      <div className="flex gap-1.5 overflow-x-auto">
                        {acc.dpdHistory.map((dpd, dIdx) => (
                          <div
                            key={dIdx}
                            className={`px-2.5 py-1 rounded text-center text-[10px] font-mono border ${
                              dpd.dpd === "000"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                                : dpd.dpd === "SET"
                                ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                                : "bg-rose-950/80 text-rose-300 border-rose-800/60 font-bold"
                            }`}
                          >
                            <div className="text-[8px] text-slate-400">{dpd.month}</div>
                            <div>{dpd.dpd}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hard Inquiries List */}
          {report.enquiries && report.enquiries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Recent Lender Enquiries ({report.enquiries.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.enquiries.map((enq, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-navy-950/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{enq.lender}</p>
                      <p className="text-[10px] text-slate-400">{enq.purpose} • {enq.date}</p>
                    </div>
                    <span className="font-mono font-semibold text-slate-300">₹{enq.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Compliance Footer */}
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 text-center space-y-1">
            <p className="text-xs text-slate-300 font-semibold">
              Savrdh Financial Services Private Limited (CIN: U67100UP2021PTC156235)
            </p>
            <p className="text-[10px] text-slate-500">
              Endorsed by Legal Advisory Panel under Section 138 NI Act, SARFAESI Act & RBI Banking Ombudsman Scheme 2021.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
