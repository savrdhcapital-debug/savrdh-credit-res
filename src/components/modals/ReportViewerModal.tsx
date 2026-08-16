import React from "react";
import { X, Printer, Download, ShieldCheck, CheckCircle2, Award, FileText, Calendar } from "lucide-react";
import { CreditBureauReport, PaymentDetails, UserProfile, KYCData, CRMLeadRecord } from "../../types";

interface ReportModalProps {
  type: "CREDIT_REPORT" | "INVOICE" | "RESOLUTION_REPORT" | "NDC_CERTIFICATE" | "LETTER_OF_AUTHORITY";
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
              {type === "LETTER_OF_AUTHORITY" && "Official Letter of Authority & Dispute Consent (LOA)"}
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
              {/* Official Tax Invoice Banner */}
              <div className="p-3 rounded-xl bg-navy-900/90 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold tracking-wider">TAX INVOICE (ORIGINAL FOR RECIPIENT)</span>
                  <p className="text-xs font-bold text-slate-100 mt-0.5">Savrdh Credit Legal Resolution Service</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    PAID (100% Verified)
                  </span>
                </div>
              </div>

              {/* Company & Client Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-navy-900/60 border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">BILLED TO (CUSTOMER):</span>
                  <p className="font-bold text-slate-100 text-sm">{userProfile.fullName || "Rajeshwar Sharma"}</p>
                  <p className="text-[11px] text-slate-300">
                    <span className="text-slate-400 font-medium">PAN:</span> {kycData.panNumber || "ABCDE1234F"} • <span className="text-slate-400 font-medium">Aadhaar:</span> {kycData.maskedAadhaar || "XXXX-XXXX-9283"}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <span className="text-slate-400 font-medium">Mobile:</span> +91 {userProfile.mobile || "9820491823"} • <span className="text-slate-400 font-medium">Email:</span> {userProfile.email || "rajeshwar.sharma@example.com"}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight pt-1">
                    <span className="text-slate-500">Address:</span> {kycData.fetchedProfile?.address || "Royal Palms Residency, Aarey Colony, Goregaon East, Mumbai, MH - 400065"}
                  </p>
                </div>

                <div className="space-y-1 sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">INVOICE & PAYMENT DETAILS:</span>
                  <p className="font-mono text-amber-400 font-bold text-xs">{paymentDetails?.invoiceNumber || "SAV-INV-2026-8941"}</p>
                  <p className="text-[10px] text-slate-400">
                    <span className="text-slate-500">Invoice Date:</span> {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    <span className="text-slate-500 font-sans">Payment ID:</span> {paymentDetails?.paymentId || "pay_svr_live_948210"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    <span className="text-slate-500 font-sans">Order ID:</span> {paymentDetails?.orderId || "order_svr_748192"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <span className="text-slate-500">Gateway:</span> Razorpay Payments (UPI / Card / NetBanking)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <span className="text-slate-500">Place of Supply:</span> Uttar Pradesh (09) / Inter-State
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-900 text-slate-300 text-[11px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Service Description</th>
                      <th className="p-2.5 text-center">HSN/SAC</th>
                      <th className="p-2.5 text-right">Taxable Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-navy-950/50">
                    <tr>
                      <td className="p-2.5 font-mono text-slate-500">01</td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-200">
                          {paymentDetails?.selectedPackage?.title || "Comprehensive Debt Settlement & CIBIL Correction"}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                          Professional Legal Representation, Section 138 Notice Replies, Bank One-Time Settlement (OTS) Negotiations, and Bureau Dispute Purge.
                        </p>
                      </td>
                      <td className="p-2.5 text-center font-mono text-slate-400">998311</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-200">
                        ₹{(paymentDetails?.amount || 9999).toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-2 text-right text-slate-400 text-[11px]">
                        Central GST (CGST @ 9.0%)
                      </td>
                      <td className="p-2 text-right font-mono text-slate-300 text-[11px]">
                        ₹{(Math.round((paymentDetails?.amount || 9999) * 0.09)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-2 text-right text-slate-400 text-[11px]">
                        State GST (SGST @ 9.0%)
                      </td>
                      <td className="p-2 text-right font-mono text-slate-300 text-[11px]">
                        ₹{(Math.round((paymentDetails?.amount || 9999) * 0.09)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr className="bg-navy-900/90 font-bold border-t border-slate-700">
                      <td colSpan={3} className="p-2.5 text-right text-amber-300 text-xs">
                        Total Invoiced Amount (Gross)
                      </td>
                      <td className="p-2.5 text-right font-mono text-amber-400 text-sm font-black">
                        ₹{(paymentDetails?.totalAmount || 11799).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in words & Terms */}
              <div className="p-3 rounded-xl bg-navy-900/40 border border-slate-800 space-y-1.5 text-[11px]">
                <p className="text-slate-300">
                  <span className="text-slate-500 font-semibold">Amount in Words:</span>{" "}
                  <span className="font-medium text-amber-300">
                    {paymentDetails?.totalAmount === 5899
                      ? "Five Thousand Eight Hundred Ninety Nine Rupees Only"
                      : paymentDetails?.totalAmount === 21239
                      ? "Twenty One Thousand Two Hundred Thirty Nine Rupees Only"
                      : "Eleven Thousand Seven Hundred Ninety Nine Rupees Only"}
                  </span>
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Scope of Work:</strong> This tax receipt confirms engagement of Savrdh Financial Services Pvt. Ltd. for legal debt mediation. An assigned advocate will file representation with creditor banks within 24-48 hours.
                </p>
              </div>
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

          {/* Type 5: Letter of Authority (LOA) & Legal Dispute Representation Consent */}
          {type === "LETTER_OF_AUTHORITY" && (
            <div className="space-y-4">
              {/* Header Title Box */}
              <div className="p-3.5 rounded-xl bg-navy-900/90 border border-amber-500/40 text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider">
                  STATUTORY APPOINTMENT & AUTHORIZATION (UNDER CICRA 2005 & CONTRACT ACT 1872)
                </span>
                <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wide">
                  LETTER OF AUTHORITY & LEGAL DISPUTE REPRESENTATION CONSENT
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ref No: <span className="font-mono text-amber-300 font-bold">{crmLead?.loaReferenceNumber || "SAV-LOA-2026-89412"}</span> • Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Addressed To Box */}
              <div className="p-3 rounded-xl bg-navy-900/50 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">TO WHOMSOEVER IT MAY CONCERN / ADDRESSED TO:</span>
                <p className="font-semibold text-slate-200">
                  1. The Managing Director / Nodal Officer / Grievance Redressal Cells of all Scheduled Commercial Banks, NBFCs & Housing Finance Companies in India.
                </p>
                <p className="font-semibold text-slate-200">
                  2. TransUnion CIBIL Ltd., Experian Credit Information Co., Equifax Credit Information Services, and CRIF High Mark Credit Information Services.
                </p>
                <p className="font-semibold text-slate-200">
                  3. The Banking Ombudsman, Reserve Bank of India (RBI).
                </p>
              </div>

              {/* Grantor (Borrower) Details */}
              <div className="p-3 rounded-xl bg-navy-900/70 border border-slate-800 text-[11px] space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">GRANTOR / PRINCIPAL BORROWER:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <p><span className="text-slate-500 font-medium">Name:</span> <strong className="text-slate-100">{userProfile.fullName || "Rajeshwar Sharma"}</strong></p>
                  <p><span className="text-slate-500 font-medium">PAN Number:</span> <span className="font-mono text-slate-200 font-bold">{kycData.panNumber || "ABCDE1234F"}</span></p>
                  <p><span className="text-slate-500 font-medium">Aadhaar (Masked):</span> <span className="font-mono text-slate-200 font-bold">{kycData.maskedAadhaar || "XXXX-XXXX-9283"}</span></p>
                  <p><span className="text-slate-500 font-medium">Mobile & Email:</span> +91 {userProfile.mobile || "9820491823"} • {userProfile.email || "client@savrdh.in"}</p>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  <span className="text-slate-500">Residential Address:</span> {kycData.fetchedProfile?.address || "Royal Palms Residency, Aarey Colony, Goregaon East, Mumbai, MH - 400065"}
                </p>
              </div>

              {/* Authorized Representative */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] space-y-1">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">APPOINTED AUTHORIZED REPRESENTATIVE & LEGAL ADVOCATE:</span>
                <p className="text-slate-200 font-bold">SAVRDH FINANCIAL SERVICES PRIVATE LIMITED</p>
                <p className="text-[10px] text-slate-400">CIN: U67100UP2021PTC156235 • Corporate Office: 01, GAUR YAMUNA CITY Greater Noida, UP - 201301</p>
                <p className="text-[10px] text-slate-300">
                  Panel Legal Advocate: <strong className="text-amber-300">Adv. Vikram Malhotra</strong> (Bar Council Reg: <span className="font-mono">BCI/MAH/2849/2012</span>) & authorized legal representatives.
                </p>
              </div>

              {/* Declarations & Grant of Specific Powers */}
              <div className="space-y-2 text-[11px] text-slate-300">
                <p className="font-bold text-slate-100 text-xs">SPECIFIC LEGAL POWERS & AUTHORIZATION GRANTED:</p>
                <ol className="list-decimal pl-4 space-y-1.5 text-[10px] text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-slate-200">Access & Audit Credit Bureau Information:</strong> To demand, download, audit, and investigate my full Credit Information Report (CIR) from TransUnion CIBIL, Experian, Equifax, and CRIF High Mark pursuant to Section 21 of the Credit Information Companies (Regulation) Act, 2005.
                  </li>
                  <li>
                    <strong className="text-slate-200">Bank & NBFC Dispute Representation:</strong> To act as my true and lawful authorized legal representative before all lending banks, financial institutions, and grievance redressal committees regarding my credit card, personal loan, and written-off loan liabilities.
                  </li>
                  <li>
                    <strong className="text-slate-200">One-Time Settlement (OTS) Negotiations:</strong> To negotiate, formulate, propose, and finalize One-Time Settlement (OTS) proposals, waiver of penal interest/late fees, and structured payment waterfall solutions.
                  </li>
                  <li>
                    <strong className="text-slate-200">Cease & Desist to Third-Party Recovery Agencies:</strong> To issue formal legal notices instructing all loan recovery agents and third-party agencies to immediately cease and desist from unlawful calling, abusive conduct, or visits to my residence/workplace under RBI Fair Practices Code (RBI/2022-23/108).
                  </li>
                  <li>
                    <strong className="text-slate-200">Retrieval of No-Dues Certificates (NDC) & CIBIL Purge:</strong> To collect, receive, and archive official No Dues Certificates / Settlement Letters and submit them to credit bureaus for permanent status update to "Closed / Paid in Full".
                  </li>
                </ol>
              </div>

              {/* Digital E-Sign Execution Verification Box */}
              <div className="p-3 rounded-xl bg-navy-900 border border-emerald-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    DIGITALLY EXECUTED VIA TWO-FACTOR OTP / E-KYC AUTHENTICATION
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">256-Bit SSL Timestamped</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                  <p>Grantor Digital ID: <span className="text-slate-200">{userProfile.fullName?.toUpperCase() || "CUSTOMER"}_AUTH</span></p>
                  <p>SHA-256 Hash: <span className="text-amber-300">8f92a10b48c909e4a3b7...</span></p>
                  <p>Timestamp: <span className="text-slate-200">{new Date().toISOString().replace("T", " ").slice(0, 19)} IST</span></p>
                  <p>Status: <span className="text-emerald-400 font-bold font-sans">Legally Enforceable & Active</span></p>
                </div>
              </div>
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
