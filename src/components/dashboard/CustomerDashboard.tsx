import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  Bell,
  Scale,
  MessageSquare,
  FolderLock,
  FileText,
  TrendingUp,
  User,
  Phone,
  Mail,
  Send,
  Paperclip,
  Image as ImageIcon,
  CheckCheck,
  Check,
  AlertTriangle,
  Clock,
  ChevronRight,
  Upload,
  Eye,
  Download,
  Receipt,
  Sparkles,
  Lock,
  Calendar,
  CheckCircle2,
  Building,
  RefreshCw,
  Camera,
  ExternalLink,
  SlidersHorizontal,
  LogOut,
  Briefcase,
} from "lucide-react";
import {
  UserProfile,
  KYCData,
  CreditBureauReport,
  AICreditAnalysis,
  ResolutionPackage,
  PaymentDetails,
  CRMLeadRecord,
  AssignedAdvisor,
  CaseMilestone,
  ChatMessage,
  UploadedDoc,
  AppNotification
} from "../../types";
import {
  INITIAL_CASE_MILESTONES,
  INITIAL_CHAT_MESSAGES,
  INITIAL_UPLOADED_DOCS,
  INITIAL_NOTIFICATIONS,
  ASSIGNED_ADVISOR,
  SAVRDH_COMPANY_INFO
} from "../../data/mockData";
import { BrandLogo } from "../common/BrandLogo";
import { askAdvisorSmartReply, uploadLeadDocumentApi } from "../../services/api";

interface DashboardProps {
  userProfile: UserProfile;
  kycData: KYCData;
  creditReport: CreditBureauReport;
  analysis: AICreditAnalysis;
  packageSelected: ResolutionPackage;
  paymentDetails: PaymentDetails;
  crmLead: CRMLeadRecord;
  advisor?: AssignedAdvisor;
  onOpenReportModal: (type: "CREDIT_REPORT" | "INVOICE" | "RESOLUTION_REPORT" | "NDC_CERTIFICATE" | "LETTER_OF_AUTHORITY") => void;
  onOpenSecurityModal: () => void;
  onLogout: () => void;
  onOpenAdminCRM?: () => void;
}

export const CustomerDashboard: React.FC<DashboardProps> = ({
  userProfile,
  kycData,
  creditReport,
  analysis,
  packageSelected,
  paymentDetails,
  crmLead,
  advisor = ASSIGNED_ADVISOR,
  onOpenReportModal,
  onOpenSecurityModal,
  onLogout,
  onOpenAdminCRM,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "messages" | "documents" | "reports" | "notifications">("overview");
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isAdvisorTyping, setIsAdvisorTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Document Vault state initialized with KYC uploaded docs and signed Letter of Authority
  const [documents, setDocuments] = useState<UploadedDoc[]>(() => {
    const initialList: UploadedDoc[] = [];

    // Always place the signed Letter of Authority at the top
    initialList.push({
      id: "doc-loa-signed",
      category: "LETTER_OF_AUTHORITY",
      title: "Letter of Authority & Legal Representation Consent (LOA)",
      fileName: `SAVRDH_LOA_${kycData?.panNumber || "DISPUTE"}_SIGNED.pdf`,
      fileSize: "1.8 MB",
      uploadedAt: "Today",
      status: "VERIFIED",
      notes: "Executed under CICRA 2005 & Contract Act 1872 for Bank & CIBIL dispute handling.",
    });

    if (kycData?.panDocName) {
      initialList.push({
        id: "kyc-pan-1",
        category: "PAN",
        title: "Customer PAN Card Document",
        fileName: kycData.panDocName,
        fileSize: "1.2 MB",
        uploadedAt: "Today",
        status: "VERIFIED",
        notes: `Uploaded via Savrdh Direct Desk (${kycData.panNumber || "Active"}).`,
      });
    } else {
      initialList.push(INITIAL_UPLOADED_DOCS[0]);
    }

    if (kycData?.aadhaarFrontDocName) {
      initialList.push({
        id: "kyc-aadhaar-front",
        category: "OTHER",
        title: "Aadhaar Card (Front Side Photo)",
        fileName: kycData.aadhaarFrontDocName,
        fileSize: "1.6 MB",
        uploadedAt: "Today",
        status: "VERIFIED",
        notes: `Masked UIDAI ID: ${kycData.maskedAadhaar || "XXXX-XXXX-XXXX"}.`,
      });
    }

    if (kycData?.aadhaarBackDocName) {
      initialList.push({
        id: "kyc-aadhaar-back",
        category: "OTHER",
        title: "Aadhaar Card (Back Side Address)",
        fileName: kycData.aadhaarBackDocName,
        fileSize: "1.3 MB",
        uploadedAt: "Today",
        status: "VERIFIED",
        notes: "Verified address record attached for bank representation.",
      });
    }

    // Add recovery notices and bank statements
    initialList.push(...INITIAL_UPLOADED_DOCS.slice(1));
    return initialList;
  });
  const [uploadCategory, setUploadCategory] = useState<UploadedDoc["category"]>("RECOVERY_NOTICE");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Case Milestones
  const [milestones, setMilestones] = useState<CaseMilestone[]>(INITIAL_CASE_MILESTONES);

  useEffect(() => {
    if (activeTab === "messages") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setIsAdvisorTyping(true);

    // AI Advisor response
    const replyText = await askAdvisorSmartReply(
      userText,
      userProfile.fullName || "Customer",
      "Legal Review & Bank Communication"
    );

    setTimeout(() => {
      setIsAdvisorTyping(false);
      const advisorReplyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "advisor",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };
      setChatMessages((prev) => [...prev, advisorReplyMsg]);
    }, 1200);
  };

  const handleAttachMockFile = (type: "pdf" | "image") => {
    const attachMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      text: type === "pdf" ? "Attached recent bank communication notice copy for your review." : "Attached photograph of the recovery letter.",
      mediaType: type,
      mediaName: type === "pdf" ? "Bank_Settlement_Offer_Letter.pdf" : "Notice_Scan_Photo.jpg",
      mediaSize: type === "pdf" ? "1.8 MB" : "940 KB",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: true,
    };
    setChatMessages((prev) => [...prev, attachMsg]);

    setIsAdvisorTyping(true);
    setTimeout(() => {
      setIsAdvisorTyping(false);
      const ackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "advisor",
        text: `Received the ${type.toUpperCase()} file. I am reviewing the fine print and will cross-verify with the bank's nodal desk immediately.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isRead: true,
      };
      setChatMessages((prev) => [...prev, ackMsg]);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const newDoc: UploadedDoc = {
        id: `doc-${Date.now()}`,
        category: uploadCategory,
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: "Just now",
        status: "UNDER_REVIEW",
        notes: "Uploaded by customer via portal. Stored in encrypted vault.",
        dataUrl: base64,
      };
      setDocuments((prev) => [newDoc, ...prev]);

      // Sync with Admin CRM Lead endpoint
      await uploadLeadDocumentApi(userProfile.id || "lead-1", {
        category: uploadCategory,
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dataUrl: base64,
        notes: "Uploaded by customer from client portal.",
      });

      setIsUploading(false);
      setUploadSuccessMsg(`Document "${file.name}" uploaded successfully for legal verification!`);
      setTimeout(() => setUploadSuccessMsg(""), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleMarkNotifRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070B14] text-slate-100 pb-20">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-navy-950/90 border-b border-navy-700/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <BrandLogo size="sm" showTagline={false} />

        <div className="flex items-center gap-2">
          {/* Active Case Pill */}
          <div className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
            <Scale className="w-3 h-3 text-amber-400" />
            <span>Legal Review</span>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => setActiveTab("notifications")}
            className="p-2 rounded-xl bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-slate-300 relative cursor-pointer"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* CRM Portal Link */}
          {onOpenAdminCRM && (
            <button
              onClick={onOpenAdminCRM}
              className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 cursor-pointer"
              title="Staff Admin CRM Portal"
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Security / Settings Button */}
          <button
            onClick={onOpenSecurityModal}
            className="p-2 rounded-xl bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-slate-300 cursor-pointer"
            title="Security Settings"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </header>

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Customer & Case Welcome Banner */}
            <div className="p-4 rounded-2xl navy-card-gold relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <img
                    src={kycData.fetchedProfile?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"}
                    alt="Customer Avatar"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-amber-500/50"
                  />
                  <div>
                    <h2 className="text-xs font-bold text-slate-100">
                      {kycData.fetchedProfile?.name || userProfile.fullName || creditReport.verifiedProfile?.matchedName || "Valued Client"}
                    </h2>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Aadhaar: {kycData.maskedAadhaar || "XXXX-XXXX-XXXX"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  Case Active
                </span>
              </div>

              {/* Score & Projected Recovery Row */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Current Score
                  </span>
                  <span className="text-2xl font-extrabold font-mono text-rose-400">
                    {creditReport.score}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{Math.abs(analysis.projectedScore - creditReport.score)} Pts</span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">
                    Target: {analysis.projectedScore}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Overdue Debt
                  </span>
                  <span className="text-base font-bold font-mono text-slate-100">
                    ₹{(creditReport.summary.totalOverdue / 100000).toFixed(2)}L
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Advisor Quick Card */}
            <div className="p-3.5 rounded-2xl navy-card border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Your Assigned Resolution Advocate
                </span>
                <button
                  onClick={() => setActiveTab("messages")}
                  className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Chat Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={advisor.photo}
                  alt={advisor.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 flex-shrink-0"
                />
                <div className="text-xs">
                  <h4 className="font-bold text-slate-100">{advisor.name}</h4>
                  <p className="text-[10px] text-amber-300 font-medium">{advisor.designation}</p>
                  <p className="text-[10px] text-slate-400">Reg: {advisor.barCouncilNumber}</p>
                </div>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onOpenReportModal("LETTER_OF_AUTHORITY")}
                className="col-span-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-left cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100">Official Letter of Authority (LOA)</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ACTIVE & VERIFIED
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Authorizes Savrdh to legally dispute accounts with CIBIL & Banks on your behalf
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-amber-500 text-navy-950 text-[10px] font-bold flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("timeline")}
                className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition-all space-y-1"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 w-fit">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Track Case Progress</h4>
                <p className="text-[10px] text-slate-400">Stage: Legal Notice Drafting</p>
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition-all space-y-1"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 w-fit">
                  <FolderLock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Document Locker</h4>
                <p className="text-[10px] text-slate-400">{documents.length} Files Encrypted</p>
              </button>

              <button
                onClick={() => onOpenReportModal("INVOICE")}
                className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition-all space-y-1"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                  <Receipt className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">GST Tax Invoice</h4>
                <p className="text-[10px] text-slate-400">Paid ₹{paymentDetails?.totalAmount?.toLocaleString() || "11,799"}</p>
              </button>

              <button
                onClick={() => onOpenReportModal("CREDIT_REPORT")}
                className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition-all space-y-1"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 w-fit">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-200">Bureau Audit Report</h4>
                <p className="text-[10px] text-slate-400">{creditReport.bureauName}</p>
              </button>
            </div>

            {/* CRM Ingestion Status Badge */}
            <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SAVRDH CRM Lead: <strong className="text-slate-200 font-mono">{crmLead?.crmReferenceId || "CRM-SVR-8942"}</strong></span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">LIVE SYNCED</span>
            </div>

            {/* Official Company Details & Support Center */}
            <div className="p-4 rounded-2xl navy-card border border-amber-500/20 space-y-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-heading">
                    <Building className="w-4 h-4 text-amber-400" />
                    {SAVRDH_COMPANY_INFO.name}
                  </h3>
                  <p className="text-[10px] text-amber-400/90 font-medium mt-0.5">
                    {SAVRDH_COMPANY_INFO.businessType}
                  </p>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-navy-900 border border-slate-700 text-slate-400">
                  CIN: {SAVRDH_COMPANY_INFO.cin}
                </span>
              </div>

              {/* Contact & Hours Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={`tel:${SAVRDH_COMPANY_INFO.customerCare.replace(/\s+/g, '')}`}
                  className="p-2.5 rounded-xl bg-navy-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors flex items-center gap-2 text-slate-200 group"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">CUSTOMER CARE</span>
                    <span className="text-[11px] font-bold text-amber-300">{SAVRDH_COMPANY_INFO.customerCare}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${SAVRDH_COMPANY_INFO.supportEmail}`}
                  className="p-2.5 rounded-xl bg-navy-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors flex items-center gap-2 text-slate-200 group"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 group-hover:scale-105 transition-transform">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-slate-400 block font-semibold">SUPPORT EMAIL</span>
                    <span className="text-[10px] font-medium text-slate-200 truncate block">{SAVRDH_COMPANY_INFO.supportEmail}</span>
                  </div>
                </a>
              </div>

              {/* Address & Hours */}
              <div className="p-2.5 rounded-xl bg-navy-950/60 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="font-semibold text-slate-300">Office:</span>
                  <span className="text-slate-400">{SAVRDH_COMPANY_INFO.corporateOffice}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px]">
                  <span className="text-slate-400">
                    <strong className="text-slate-300">Working Hours:</strong> {SAVRDH_COMPANY_INFO.workingHours}
                  </span>
                  <a
                    href={SAVRDH_COMPANY_INFO.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* Specialized Services Provided */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Our Comprehensive Financial Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAVRDH_COMPANY_INFO.services.map((svc, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-navy-900 border border-slate-800 text-[10px] text-slate-300"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CASE TRACKING (STEP 13) ================= */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Live Case Tracking Timeline</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                8-Stage Structured Resolution Milestone Ledger
              </p>
            </div>

            {/* Timeline Stepper */}
            <div className="p-4 rounded-2xl navy-card space-y-4">
              {milestones.map((m, idx) => {
                const isDone = m.status === "COMPLETED";
                const isCurrent = m.status === "CURRENT";

                return (
                  <div key={m.id} className="relative flex items-start gap-3">
                    {/* Line Connector */}
                    {idx < milestones.length - 1 && (
                      <div
                        className={`absolute left-3 top-7 bottom-0 w-0.5 -ml-px ${
                          isDone ? "bg-emerald-500/60" : "bg-slate-800"
                        }`}
                      />
                    )}

                    {/* Step Icon Indicator */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 ${
                        isDone
                          ? "bg-emerald-500 text-navy-950 shadow-sm shadow-emerald-500/50"
                          : isCurrent
                          ? "bg-amber-500 text-navy-950 ring-4 ring-amber-500/20 animate-pulse"
                          : "bg-navy-900 border border-slate-700 text-slate-500"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-bold ${
                            isCurrent
                              ? "text-amber-300"
                              : isDone
                              ? "text-slate-200"
                              : "text-slate-400"
                          }`}
                        >
                          {m.title}
                        </h4>
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.2 rounded-full ${
                            isDone
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isCurrent
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "text-slate-600"
                          }`}
                        >
                          {isDone ? "Completed" : isCurrent ? "Active Stage" : "Upcoming"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {m.subtitle}
                      </p>

                      {m.notes && (
                        <div className="mt-2 p-2 rounded-lg bg-navy-950 border border-slate-800 text-[10px] text-slate-300">
                          <strong>Note:</strong> {m.notes}
                        </div>
                      )}

                      {m.completedDate && (
                        <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                          Archived: {m.completedDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: MESSAGING (STEP 11) ================= */}
        {activeTab === "messages" && (
          <div className="flex flex-col h-[75vh] rounded-2xl navy-card overflow-hidden border border-slate-800">
            {/* Chat Header */}
            <div className="p-3 bg-navy-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={advisor.photo}
                    alt={advisor.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-amber-500/50"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-navy-950" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">{advisor.name}</h3>
                  <p className="text-[10px] text-amber-300">Active Legal Counsel • Savrdh</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${advisor.phone}`}
                  className="p-2 rounded-lg bg-navy-900 text-slate-300 hover:text-amber-400"
                  title="Call Advisor"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => {
                const isCustomer = msg.sender === "customer";
                const isSystem = msg.sender === "system";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="text-[10px] bg-navy-950/80 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                        isCustomer
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 font-medium rounded-tr-xs"
                          : "bg-navy-900 border border-slate-800 text-slate-200 rounded-tl-xs"
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* PDF or Image Attachment Card */}
                      {msg.mediaType && (
                        <div
                          className={`p-2 rounded-xl flex items-center gap-2 text-[11px] ${
                            isCustomer ? "bg-navy-950/20 text-navy-950" : "bg-navy-950 text-amber-300 border border-slate-800"
                          }`}
                        >
                          {msg.mediaType === "pdf" ? (
                            <FileText className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ImageIcon className="w-4 h-4 flex-shrink-0" />
                          )}
                          <div className="truncate flex-1">
                            <p className="font-bold truncate">{msg.mediaName}</p>
                            <span className="text-[9px] opacity-75">{msg.mediaSize}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1 px-1">
                      <span>{msg.timestamp}</span>
                      {isCustomer && <CheckCheck className="w-3 h-3 text-amber-400" />}
                    </div>
                  </div>
                );
              })}

              {isAdvisorTyping && (
                <div className="flex items-center gap-2 text-[11px] text-amber-400 p-2 bg-navy-900/60 rounded-xl w-fit">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Adv. Vikram Malhotra is typing...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Attachment Triggers */}
            <div className="px-3 py-1.5 bg-navy-950 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[10px]">
              <button
                type="button"
                onClick={() => handleAttachMockFile("pdf")}
                className="px-2 py-1 rounded bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-slate-300 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3 h-3 text-amber-400" />
                <span>Attach Bank Notice (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => handleAttachMockFile("image")}
                className="px-2 py-1 rounded bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-slate-300 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Camera className="w-3 h-3 text-amber-400" />
                <span>Upload Photo / Scan</span>
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 bg-navy-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message your resolution advocate..."
                className="flex-1 px-3 py-2 bg-navy-900 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-gold-gradient text-navy-950 font-bold hover:brightness-110 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 4: DOCUMENT VAULT (STEP 12) ================= */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Confidential Document Vault</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload bank recovery notices, loan statements, court notices, or settlement documents.
              </p>
            </div>

            {/* Upload Box */}
            <div className="p-4 rounded-2xl navy-card space-y-3">
              <span className="text-xs font-semibold text-slate-300 block">
                Select Document Category to Upload
              </span>

              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as UploadedDoc["category"])}
                className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="RECOVERY_NOTICE">Bank Recovery / Demand Notice</option>
                <option value="BANK_STATEMENT">6-Month Bank Statement</option>
                <option value="LOAN_STATEMENT">Loan / Credit Card Account Statement</option>
                <option value="SETTLEMENT_LETTER">Prior Bank Settlement Letter / NOC</option>
                <option value="COURT_NOTICE">Court / Legal / Arbitration Notice</option>
                <option value="PAN">PAN / Identity Document</option>
                <option value="OTHER">Other Supporting Financial Documents</option>
              </select>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-navy-950/60 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">Encrypting & Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Tap to Browse or Scan Document
                    </span>
                    <span className="text-[10px] text-slate-500">
                      PDF, JPG, PNG up to 25MB • 256-Bit Encrypted
                    </span>
                  </>
                )}
              </button>

              {uploadSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Document List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 px-1">
                Uploaded Records ({documents.length})
              </h3>

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl navy-card border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-navy-950 text-amber-400 border border-slate-800 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">{doc.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {doc.fileName} • {doc.fileSize}
                      </p>
                      {doc.notes && (
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {doc.status}
                    </span>
                    {doc.category === "LETTER_OF_AUTHORITY" ? (
                      <button
                        onClick={() => onOpenReportModal("LETTER_OF_AUTHORITY")}
                        className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View LOA</span>
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-500 block">
                        {doc.uploadedAt}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: REPORTS & INVOICES (STEP 15) ================= */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Reports, Certificates & Invoices</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Download verified CIBIL audits, case reports, tax invoices, and dispute petitions.
              </p>
            </div>

            <div className="space-y-3">
              {/* Item 0: Letter of Authority & Dispute Representation Consent */}
              <div className="p-3.5 rounded-2xl navy-card border border-amber-500/40 bg-amber-500/5 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-100">Letter of Authority (LOA) & Consent</h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Ref #{crmLead?.loaReferenceNumber || "SAV-LOA-2026-8941"} • Executed via E-Sign
                    </p>
                    <span className="text-[10px] text-amber-300 font-medium">
                      Empowers Savrdh to legally represent in CIBIL & Bank disputes
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenReportModal("LETTER_OF_AUTHORITY")}
                  className="px-3 py-1.5 rounded-lg bg-gold-gradient text-navy-950 text-xs font-bold flex items-center gap-1 cursor-pointer hover:brightness-110"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View LOA</span>
                </button>
              </div>

              {/* Item 1: GST Tax Invoice */}
              <div className="p-3.5 rounded-2xl navy-card border border-slate-800 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Official GST Tax Invoice & Receipt</h4>
                    <p className="text-[10px] text-slate-400">
                      Invoice #{paymentDetails?.invoiceNumber || "SAV-INV-2026-8941"} • Paid
                    </p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      ₹{paymentDetails?.totalAmount?.toLocaleString() || "11,799"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenReportModal("INVOICE")}
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>

              {/* Item 2: Credit Audit Report */}
              <div className="p-3.5 rounded-2xl navy-card border border-slate-800 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Credit Bureau Audit Summary</h4>
                    <p className="text-[10px] text-slate-400">
                      {creditReport.bureauName} • Score: {creditReport.score}
                    </p>
                    <span className="text-[10px] text-rose-400 font-medium">
                      {creditReport.summary.writtenOffAccountsCount} Written-off accounts diagnosed
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenReportModal("CREDIT_REPORT")}
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>

              {/* Item 3: Legal Case Roadmap */}
              <div className="p-3.5 rounded-2xl navy-card border border-slate-800 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Legal Case Resolution Roadmap</h4>
                    <p className="text-[10px] text-slate-400">
                      Advocate-led OTS proposal & Section 138 reply plan
                    </p>
                    <span className="text-[10px] text-amber-300 font-medium">
                      Adv. Vikram Malhotra
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenReportModal("RESOLUTION_REPORT")}
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>

              {/* Item 4: NDC Certificate Draft */}
              <div className="p-3.5 rounded-2xl navy-card border border-slate-800 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Draft CIBIL Rectification Petition</h4>
                    <p className="text-[10px] text-slate-400">
                      Under CICRA 2005 & RBI Fair Practices
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenReportModal("NDC_CERTIFICATE")}
                  className="px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: NOTIFICATIONS (STEP 14) ================= */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100">Notifications Center</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time alerts on your resolution case</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
                className="text-[10px] text-amber-400 hover:underline"
              >
                Mark all read
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    handleMarkNotifRead(notif.id);
                    if (notif.actionTab) setActiveTab(notif.actionTab as any);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    notif.isRead
                      ? "bg-navy-950/60 border-slate-800 text-slate-400"
                      : "bg-navy-900 border-amber-500/40 text-slate-200 shadow-sm shadow-amber-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      <h4 className="text-xs font-bold text-slate-100">{notif.title}</h4>
                    </div>
                    <span className="text-[9px] text-slate-500">{notif.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= BOTTOM NAVIGATION DOCK ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 border-t border-navy-700/90 backdrop-blur-lg px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {/* 1. Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "overview"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] mt-1">Overview</span>
          </button>

          {/* 2. Tracking */}
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "timeline"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span className="text-[10px] mt-1">Case Track</span>
          </button>

          {/* 3. Messages */}
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative cursor-pointer ${
              activeTab === "messages"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px] mt-1">Advisor</span>
          </button>

          {/* 4. Documents */}
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "documents"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span className="text-[10px] mt-1">Vault</span>
          </button>

          {/* 5. Reports */}
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
              activeTab === "reports"
                ? "text-amber-400 bg-amber-500/10 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px] mt-1">Reports</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
