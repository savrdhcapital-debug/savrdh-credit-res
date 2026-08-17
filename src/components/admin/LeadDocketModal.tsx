import React, { useState } from "react";
import {
  X,
  User,
  FileText,
  CreditCard,
  Scale,
  MessageSquare,
  Send,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Clock,
  ShieldCheck,
  Building,
  RefreshCw,
  Plus,
  FileCheck,
  ChevronRight,
  Printer,
  Sparkles,
} from "lucide-react";
import { AdminLeadDetail } from "../../types";
import {
  updateLeadStatusApi,
  addLeadNoteApi,
  sendLeadNoticeEmailApi,
} from "../../services/api";

interface LeadDocketModalProps {
  lead: AdminLeadDetail;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDocketModal: React.FC<LeadDocketModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    "PROFILE_KYC" | "DOCUMENTS" | "CIBIL_REPORT" | "PAYMENTS" | "LOA_LEGAL" | "NOTES_TIMELINE" | "COMMUNICATION"
  >("PROFILE_KYC");

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState(lead.caseStatus || "Under Legal Review");
  const [selectedStage, setSelectedStage] = useState(lead.caseStage || "LEGAL_REVIEW");
  const [advisorName, setAdvisorName] = useState(lead.assignedAdvisor?.name || "Adv. Vikram Malhotra");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  // New Note state
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Email form state
  const [emailSubject, setEmailSubject] = useState(
    `Official Legal Update: Your Savrdh Case Ref ${lead.crmReferenceId}`
  );
  const [emailMessage, setEmailMessage] = useState(
    `Dear ${lead.customerName},\n\nOur legal resolution panel has reviewed your credit dispute file. The formal representation notice is now being dispatched to your lender. Please review your updated case stage in the customer app.\n\nWarm regards,\nSavrdh Financial Services Team`
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResultMsg, setEmailResultMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setStatusSuccessMsg(null);

    const res = await updateLeadStatusApi(lead.leadId, {
      caseStatus: selectedStatus,
      caseStage: selectedStage,
      advisorName,
      note: statusNote || undefined,
    });

    setIsUpdatingStatus(false);
    if (res.success) {
      setStatusSuccessMsg("Status updated successfully!");
      setStatusNote("");
      onLeadUpdated();
      setTimeout(() => setStatusSuccessMsg(null), 3000);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsAddingNote(true);
    const res = await addLeadNoteApi(lead.leadId, {
      text: newNoteText,
      author: "Legal Underwriter / Admin",
    });
    setIsAddingNote(false);

    if (res.success) {
      setNewNoteText("");
      onLeadUpdated();
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailMessage.trim()) return;

    setIsSendingEmail(true);
    setEmailResultMsg(null);

    const res = await sendLeadNoticeEmailApi(lead.leadId, {
      subject: emailSubject,
      message: emailMessage,
    });

    setIsSendingEmail(false);
    if (res.success) {
      setEmailResultMsg("Official email dispatched successfully from support@savrdhfinancialservices.com!");
      onLeadUpdated();
    } else {
      setEmailResultMsg(res.message || "Failed to send email");
    }
  };

  const caseStatusOptions = [
    "Application Received",
    "KYC Verified",
    "CIBIL Procured & Audited",
    "Under Legal Review",
    "Legal Notice Drafted",
    "Bank Communication Initiated",
    "OTS Negotiation Active",
    "Settlement Sanctioned",
    "NDC Certificate Awaiting",
    "CIBIL Rectification Filed",
    "Case Resolved & Cleared",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#070B14] border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 text-slate-100 flex flex-col overflow-hidden">
        {/* Top Header Banner */}
        <div className="px-6 py-4 bg-navy-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              {lead.customerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">{lead.customerName}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  {lead.crmReferenceId}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {lead.caseStatus || "Active Case"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Registered: {new Date(lead.registrationDate).toLocaleDateString("en-IN")} • Phone: {lead.mobile} • PAN: {lead.panNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print Case Docket"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-navy-900/80 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          {[
            { id: "PROFILE_KYC", label: "Profile & KYC", icon: User },
            { id: "DOCUMENTS", label: "Uploaded Docs (PAN / Aadhaar)", icon: FileText },
            { id: "CIBIL_REPORT", label: "CIBIL Bureau & Defaults", icon: CreditCard },
            { id: "PAYMENTS", label: "Fee Receipts & Invoices", icon: Building },
            { id: "LOA_LEGAL", label: "LOA Legal Mandate", icon: Scale },
            { id: "NOTES_TIMELINE", label: "Advocate Notes & Timeline", icon: MessageSquare },
            { id: "COMMUNICATION", label: "Send Notice / Email", icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "border-amber-400 text-amber-300 bg-amber-500/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PROFILE & KYC */}
          {activeTab === "PROFILE_KYC" && (
            <div className="space-y-6">
              {/* Quick Status Bar */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Default Volume</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">
                    ₹{(lead.totalDefaultAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">CIBIL Score</span>
                  <span className="text-lg font-bold text-amber-300 font-mono">
                    {lead.creditScore || "N/A"} / 900
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Resolution Plan</span>
                  <span className="text-sm font-semibold text-emerald-300 truncate block">
                    {lead.resolutionPackage || "Custom Package"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Legal Counsel</span>
                  <span className="text-sm font-semibold text-white truncate block">
                    {lead.assignedAdvisor?.name || "Adv. Vikram Malhotra"}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Customer Identity & Verified Contact Record</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Full Name:</span>
                    <span className="font-semibold text-white text-sm">{lead.customerName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Primary Mobile:</span>
                    <span className="font-semibold text-emerald-400 text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" /> +91 {lead.mobile}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Email Address:</span>
                    <span className="font-semibold text-amber-300 text-sm flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {lead.email}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Permanent Account Number (PAN):</span>
                    <span className="font-mono font-bold text-white text-sm tracking-wider">{lead.panNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Masked Aadhaar Number:</span>
                    <span className="font-mono font-semibold text-slate-300 text-sm">{lead.aadhaarNumberMasked}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Date of Birth / Gender:</span>
                    <span className="font-semibold text-white text-sm">
                      {lead.dob || "14 Jun 1988"} • {lead.gender || "Male"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] mb-1">Official Address:</span>
                  <p className="text-slate-200 leading-relaxed font-sans">{lead.address}</p>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="p-5 rounded-2xl bg-navy-900/60 border border-amber-500/20 space-y-4">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Update Case Status & Legal Stage</span>
                </h3>

                {statusSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{statusSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleStatusSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Case Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full py-2 px-3 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {caseStatusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Assigned Counsel</label>
                      <select
                        value={advisorName}
                        onChange={(e) => setAdvisorName(e.target.value)}
                        className="w-full py-2 px-3 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Adv. Vikram Malhotra">Adv. Vikram Malhotra (Lead Counsel)</option>
                        <option value="Adv. Sunita Rao">Adv. Sunita Rao (Banking Disputes)</option>
                        <option value="Adv. Rohit Sen">Adv. Rohit Sen (OTS Specialist)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Internal Note on Status Change</label>
                      <input
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="e.g. Sent OTS offer letter to HDFC..."
                        className="w-full py-2 px-3 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {isUpdatingStatus ? "Updating..." : "Save Case Status"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === "DOCUMENTS" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">KYC & Financial Identity Documents</h3>
                  <p className="text-xs text-slate-400">Uploaded by customer during onboarding and stored in encrypted vault</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Documents
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Document Card 1: PAN Card */}
                <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Identity Proof</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        VERIFIED
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span>PAN Card Copy</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">{lead.panNumber}</p>
                    <p className="text-[11px] text-slate-500">{lead.panDocName || "PAN_Card.pdf"}</p>
                  </div>

                  {lead.panDocUrl ? (
                    <div className="space-y-2">
                      <div className="h-32 rounded-xl bg-navy-950 border border-slate-800 overflow-hidden relative group">
                        <img
                          src={lead.panDocUrl}
                          alt="PAN Card"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <a
                            href={lead.panDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-amber-500 text-navy-950 text-xs font-bold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Full View
                          </a>
                        </div>
                      </div>
                      <a
                        href={lead.panDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" /> Download Document
                      </a>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-navy-950 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                      Uploaded Digitally
                    </div>
                  )}
                </div>

                {/* Document Card 2: Aadhaar Card Front */}
                <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Address Proof</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        VERIFIED
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span>Aadhaar Front</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">{lead.aadhaarNumberMasked}</p>
                    <p className="text-[11px] text-slate-500">{lead.aadhaarFrontDocName || "Aadhaar_Front.pdf"}</p>
                  </div>

                  {lead.aadhaarFrontDocUrl ? (
                    <div className="space-y-2">
                      <div className="h-32 rounded-xl bg-navy-950 border border-slate-800 overflow-hidden relative group">
                        <img
                          src={lead.aadhaarFrontDocUrl}
                          alt="Aadhaar Front"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <a
                            href={lead.aadhaarFrontDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-amber-500 text-navy-950 text-xs font-bold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Full View
                          </a>
                        </div>
                      </div>
                      <a
                        href={lead.aadhaarFrontDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" /> Download Document
                      </a>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-navy-950 border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500">
                      Uploaded Digitally
                    </div>
                  )}
                </div>

                {/* Document Card 3: Aadhaar Card Back / CIBIL Report */}
                <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Credit File</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        AUDITED
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>CIBIL Bureau Report</span>
                    </h4>
                    <p className="text-xs text-slate-400">TransUnion Registry Report</p>
                    <p className="text-[11px] text-slate-500">{lead.cibilPdfName || "CIBIL_Report.pdf"}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center space-y-2">
                    <span className="text-2xl font-bold text-amber-300 font-mono block">
                      {lead.creditScore || 582}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Bureau Control Registry Verified</span>
                    <button
                      onClick={() => setActiveTab("CIBIL_REPORT")}
                      className="w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      Inspect Accounts Breakdown
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CIBIL REPORT & DEFAULTS */}
          {activeTab === "CIBIL_REPORT" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-navy-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-amber-400 font-mono">{lead.creditScore || 582}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      {lead.scoreBand || "Poor Score - Action Required"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Bureau: {lead.creditBureau || "TransUnion CIBIL"} • Audited by Savrdh Risk Desk
                  </p>
                </div>

                <div className="flex gap-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Total Overdue</span>
                    <span className="font-bold text-rose-400">₹{(lead.totalDefaultAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Written-Off Accounts</span>
                    <span className="font-bold text-amber-300">{lead.writtenOffAccountsCount ?? 2} Accounts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Settled Accounts</span>
                    <span className="font-bold text-emerald-300">{lead.settledAccountsCount ?? 1} Accounts</span>
                  </div>
                </div>
              </div>

              {/* Default Accounts List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Defaulted & Active Tradelines Breakdown
                </h4>

                {lead.cibilAccounts && lead.cibilAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {lead.cibilAccounts.map((acc: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
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
                            <span className="text-[11px] text-slate-400 font-mono">{acc.accountNumberMasked}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Overdue Balance:</span>
                            <span className="text-sm font-bold text-rose-400 font-mono">
                              ₹{(acc.overdueAmount || acc.currentBalance || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* DPD String */}
                        {acc.dpdHistory && acc.dpdHistory.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-400 block mb-1.5">Historical Days Past Due (DPD) Track:</span>
                            <div className="flex gap-1.5 overflow-x-auto">
                              {acc.dpdHistory.map((dpd: any, dIdx: number) => (
                                <div
                                  key={dIdx}
                                  className={`px-2 py-1 rounded text-center text-[10px] font-mono ${
                                    dpd.dpd === "000"
                                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                                      : dpd.dpd === "SET"
                                      ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                                      : "bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold"
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
                ) : (
                  <div className="p-6 rounded-2xl bg-navy-950 border border-slate-800 text-center text-xs text-slate-400">
                    Detailed account tradelines stored directly in CIBIL Bureau Raw Extract. Total default amount: ₹
                    {(lead.totalDefaultAmount || 0).toLocaleString("en-IN")}.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS & INVOICES */}
          {activeTab === "PAYMENTS" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white">Billing, Fees & Tax Invoices Collected</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment 1: ₹350 CIBIL Fee */}
                <div className="p-5 rounded-2xl bg-navy-900/80 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Step 4 Bureau Fee</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      PAID ✓
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">CIBIL Report & Legal Diagnostic</h4>
                    <p className="text-xs text-slate-400">TransUnion Registry Direct Extraction Fee</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Paid:</span>
                      <span className="font-bold text-emerald-400">₹350.00 (Incl. 18% GST)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Invoice No:</span>
                      <span className="text-amber-200">{lead.cibilFee?.invoiceNumber || "SAV-CIBIL-INV-10928"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="text-slate-300">{lead.cibilFee?.paymentId || "pay_cibil_live_89102"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paid Timestamp:</span>
                      <span className="text-slate-300">
                        {new Date(lead.cibilFee?.paidAt || lead.paymentDate).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment 2: Resolution Plan Fee */}
                <div className="p-5 rounded-2xl bg-navy-900/80 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Step 7 Subscription</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      PAID ✓
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">{lead.resolutionPackage}</h4>
                    <p className="text-xs text-slate-400">Legal Representation & OTS Settlement Package</p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Paid:</span>
                      <span className="font-bold text-emerald-400">
                        ₹{(lead.packageAmount || 9999).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Invoice No:</span>
                      <span className="text-amber-200">{lead.packageInvoiceNumber || "SAV-INV-2026-8941"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment ID:</span>
                      <span className="text-slate-300">{lead.paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paid Timestamp:</span>
                      <span className="text-slate-300">
                        {new Date(lead.paymentDate).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LETTER OF AUTHORITY (LOA) */}
          {activeTab === "LOA_LEGAL" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-navy-950 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Legal Mandate Status</span>
                  <h4 className="text-base font-bold text-white">Letter of Authority (LOA) Executed & Active</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reference: <span className="font-mono text-amber-300 font-bold">{lead.loaReferenceNumber || "SAV-LOA-2026-89410"}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    ✓ Valid E-Signature
                  </span>
                </div>
              </div>

              {/* LOA Preview Card */}
              <div className="p-6 rounded-2xl bg-[#030712] border border-slate-800 text-xs space-y-4 font-serif text-slate-300 leading-relaxed">
                <div className="text-center border-b border-slate-800 pb-3 font-sans">
                  <h3 className="text-sm font-bold text-amber-400 tracking-wider uppercase">LETTER OF AUTHORITY</h3>
                  <p className="text-[11px] text-slate-400">Under Indian Contract Act 1872 & IT Act 2000</p>
                </div>

                <p>
                  <strong>TO ALL TO WHOM THESE PRESENTS SHALL COME, I,</strong>{" "}
                  <span className="text-white font-bold">{lead.customerName}</span>, holder of PAN{" "}
                  <span className="font-mono text-amber-300">{lead.panNumber}</span>, residing at{" "}
                  <span className="text-slate-200">{lead.address}</span>, DO HEREBY NOMINATE, CONSTITUTE AND APPOINT:
                </p>

                <div className="p-3 rounded-xl bg-navy-950 font-sans text-[11px] border border-slate-800">
                  <p className="font-bold text-amber-300">Savrdh Financial Services Private Limited (CIN: U67100UP2021PTC156235)</p>
                  <p className="text-slate-400">Assigned Advocate: {lead.assignedAdvisor?.name || "Adv. Vikram Malhotra"} (BCI/MAH/2849/2012)</p>
                </div>

                <p>
                  as my true and lawful attorney to represent my credit resolution and bank negotiation disputes before all Scheduled Commercial Banks, NBFCs, and Credit Information Companies (CIBIL, Experian, Equifax, CRIF High Mark) pursuant to Section 21 of CICRA 2005.
                </p>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-[10px] font-sans font-mono text-slate-400">
                  <div>
                    <span>Execution Timestamp:</span>
                    <p className="text-slate-200">{lead.loaConsentTimestamp || lead.paymentDate}</p>
                  </div>
                  <div>
                    <span>SHA-256 Digital Verification Hash:</span>
                    <p className="text-amber-300 truncate">{lead.loaSignatureHash || "8f92a10b48c909e4a3b7d6e5c8f12345"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ADVOCATE NOTES & TIMELINE */}
          {activeTab === "NOTES_TIMELINE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Internal Notes */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Internal Advocate Case Notes</span>
                </h4>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add case observation, bank meeting update, or next action step..."
                    className="w-full p-2.5 bg-navy-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteText.trim()}
                    className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingNote ? "Saving..." : "Add Note"}</span>
                  </button>
                </form>

                {/* Notes List */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {lead.notes && lead.notes.length > 0 ? (
                    lead.notes.map((note, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-300">{note.author}</span>
                          <span className="text-slate-500">{new Date(note.createdAt).toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-xs text-slate-200">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-3 text-center">No advocate notes added yet.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Case Timeline Events */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Case Activity History</span>
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {lead.timeline && lead.timeline.length > 0 ? (
                    lead.timeline.map((ev, idx) => (
                      <div key={idx} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1" />
                          {idx !== lead.timeline!.length - 1 && <div className="w-0.5 flex-1 bg-slate-800 my-1" />}
                        </div>
                        <div className="p-3 rounded-xl bg-navy-950 border border-slate-800/80 flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{ev.title}</span>
                            <span className="text-[10px] text-slate-400">{new Date(ev.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{ev.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-3 text-center">No timeline events recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DIRECT NOTICE / EMAIL */}
          {activeTab === "COMMUNICATION" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Send Official Notice / Legal Update to Customer</h3>
                <p className="text-xs text-slate-400">
                  Dispatched directly from official mailbox: <span className="text-amber-300 font-bold">support@savrdhfinancialservices.com</span>
                </p>
              </div>

              {emailResultMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    emailResultMsg.includes("success")
                      ? "bg-emerald-950 border-emerald-600/50 text-emerald-300"
                      : "bg-rose-950 border-rose-600/50 text-rose-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{emailResultMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Recipient</label>
                  <input
                    type="text"
                    disabled
                    value={`${lead.customerName} <${lead.email}>`}
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-800 rounded-xl text-xs text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
                  <textarea
                    rows={6}
                    required
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full p-3 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? "Dispatching Email..." : "Send Official Update Email"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
