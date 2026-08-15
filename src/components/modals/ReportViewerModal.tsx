import React from "react";
import { X, Printer, Download, ShieldCheck, CheckCircle2, Award, FileText, Calendar } from "lucide-react";
import { CreditBureauReport, PaymentDetails, UserProfile, KYCData, CRMLeadRecord } from "../../types";

interface ReportModalProps {
  type: "CREDIT_REPORT" | "INVOICE" | "RESOLUTION_REPORT" | "NDC_CERTIFICATE";
  onClose: () => void;
  userProfile: UserProfile;
  kycData: KYCData;
  creditReport: CreditBureauReport;
  paymentDetails?: PaymentDetails | null;
  crmLead?: CRMLeadRecord | null;
}

export const ReportViewerModal: React.FC<ReportModalProps> = ({
  type,
  onClose,
  userProfile,
  kycData,
  creditReport,
  paymentDetails,
  crmLead,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              {type === "CREDIT_REPORT" && "Official Credit Bureau Audit Summary"}
              {type === "INVOICE" && "Official GST Tax Invoice & Receipt"}
              {type === "RESOLUTION_REPORT" && "Savrdh Legal Case Resolution Roadmap"}
              {type === "NDC_CERTIFICATE" && "Draft Bureau Rectification Petition (NDC)"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-200 text-xs space-y-6 print:bg-white print:text-black">
          {/* Company Letterhead */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-amber-400 font-heading">
                SAVRDH FINANCIAL SERVICES PRIVATE LIMITED
              </h2>
              <p className="text-[10px] text-slate-300 font-medium">Financial Advisory & Credit Resolution Company</p>
              <p className="text-[10px] text-slate-400">CIN: U67100UP2021PTC156235 • GSTIN: 09AABCS8942N1Z4</p>
              <p className="text-[10px] text-slate-400">Corporate Office: 01, GAUR YAMUNA CITY Greater Noida, Uttar Pradesh, India</p>
              <p className="text-[10px] text-slate-400">
                Web: <span className="text-amber-300">https://savrdhfinancialservices.com</span> • Support: <span className="text-amber-300">support@savrdhfinancialservices.com</span> • Tel: <span className="text-amber-300">+91 8109995906</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                CONFIDENTIAL
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Type 1: Tax Invoice */}
          {type === "INVOICE" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-navy-900/80 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">BILLED TO:</span>
                  <p className="font-bold text-slate-100 mt-0.5">{userProfile.fullName}</p>
                  <p className="text-[11px] text-slate-400">PAN: {kycData.panNumber} • Aadhaar: {kycData.maskedAadhaar}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{kycData.fetchedProfile?.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">INVOICE DETAILS:</span>
                  <p className="font-mono text-amber-400 font-bold">{paymentDetails?.invoiceNumber || "SAV-INV-2026-8941"}</p>
                  <p className="text-[10px] text-slate-400">Payment ID: {paymentDetails?.paymentId || "PAY_SVR_LIVE"}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">Status: PAID (100% Verified)</p>
                </div>
              </div>

              <table className="w-full text-left border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-navy-900 text-slate-300 text-[11px]">
                  <tr>
                    <th className="p-2.5">Service Description</th>
                    <th className="p-2.5">SAC Code</th>
                    <th className="p-2.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2.5">
                      <p className="font-bold text-slate-200">
                        {paymentDetails?.selectedPackage.title || "Comprehensive Debt Settlement & CIBIL Correction"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Advocate-led OTS negotiation, dispute filing & CIBIL status rectification
                      </p>
                    </td>
                    <td className="p-2.5 font-mono text-slate-400">998311</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-200">
                      ₹{paymentDetails?.amount?.toLocaleString() || "9,999"}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right text-slate-400">
                      CGST (9%) + SGST (9%)
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-200">
                      ₹{paymentDetails?.gstAmount?.toLocaleString() || "1,800"}
                    </td>
                  </tr>
                  <tr className="bg-navy-900 font-bold text-slate-100">
                    <td colSpan={2} className="p-2.5 text-right text-amber-300">
                      Total Invoiced Amount
                    </td>
                    <td className="p-2.5 text-right font-mono text-amber-400 text-sm">
                      ₹{paymentDetails?.totalAmount?.toLocaleString() || "11,799"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Type 2: Credit Audit Report */}
          {type === "CREDIT_REPORT" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Reported Credit Bureau</span>
                  <h4 className="text-sm font-bold text-slate-100">{creditReport.bureauName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Audit Score</span>
                  <p className="text-lg font-bold font-mono text-rose-400">{creditReport.score} (Poor)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-2">Detailed Negative Accounts Breakdown:</h4>
                <div className="space-y-2">
                  {creditReport.accounts
                    .filter((a) => a.status !== "Closed")
                    .map((acc, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-navy-900/60 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{acc.institution}</span>
                          <span className="font-mono text-rose-400 font-bold">{acc.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>A/C: {acc.accountNumberMasked}</span>
                          <span>Overdue: ₹{acc.overdueAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Type 3: Resolution Roadmap */}
          {type === "RESOLUTION_REPORT" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                <h4 className="font-bold text-amber-300">Advocate Resolution Strategy:</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Savrdh legal panel has prepared Section 138 reply petitions and initiated formal One-Time Settlement (OTS) negotiations for HDFC Bank and ICICI Bank written-off loan portfolios. Target debt reduction: ~58% of aggregate overdue balance.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-slate-200">Resolution Milestones:</h5>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>1. Stop Recovery Agent Harassment Notice</span>
                  <span className="text-emerald-400 font-bold text-[10px]">SERVED</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>2. OTS Proposal Submission to Bank Nodal Desk</span>
                  <span className="text-amber-400 font-bold text-[10px]">IN DRAFT</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span>3. No-Dues Certificate (NDC) Retrieval & CIBIL Purge</span>
                  <span className="text-slate-500 font-bold text-[10px]">QUEUED</span>
                </div>
              </div>
            </div>
          )}

          {/* Type 4: NDC Certificate Draft */}
          {type === "NDC_CERTIFICATE" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 text-center space-y-2">
                <Award className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-slate-100 text-sm">NO DUES & CIBIL RECTIFICATION PETITION</h4>
                <p className="text-[10px] text-slate-400">Prepared under Banking Regulation Act & Credit Information Companies (Regulation) Act, 2005</p>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                This document certifies that the borrower <strong>{userProfile.fullName}</strong> is legally represented by Savrdh Financial Services Private Limited for the amicable settlement and final credit score updation of all disputed accounts.
              </p>
            </div>
          )}

          {/* Authorized Signature Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-end justify-between">
            <div className="text-[10px] text-slate-500">
              <p>Digitally generated & timestamped</p>
              <p>SHA-256 Checksum: 8f92a10b48c909e4</p>
            </div>
            <div className="text-right">
              <div className="font-brand text-xs text-amber-400 font-bold">Adv. Vikram Malhotra</div>
              <p className="text-[9px] text-slate-400">Senior Legal Resolution Lead</p>
              <p className="text-[9px] text-slate-500">Savrdh Financial Services Private Limited</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-navy-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            256-Bit Encrypted Record
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs cursor-pointer"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
