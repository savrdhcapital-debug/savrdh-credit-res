import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  LogOut,
  ShieldCheck,
  Building2,
  TrendingUp,
  AlertCircle,
  FileText,
  CreditCard,
  Scale,
  Phone,
  Mail,
  ChevronRight,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";
import { AdminUser, AdminLeadDetail, AdminStats } from "../../types";
import {
  fetchAdminStatsApi,
  fetchAdminLeadsApi,
  fetchAdminLeadDocketApi,
  deleteLeadApi,
} from "../../services/api";
import { LeadDocketModal } from "./LeadDocketModal";
import { CreateManualLeadModal } from "./CreateManualLeadModal";

interface AdminCRMAppProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onSwitchToCustomerApp: () => void;
}

export const AdminCRMApp: React.FC<AdminCRMAppProps> = ({
  adminUser,
  onLogout,
  onSwitchToCustomerApp,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [leads, setLeads] = useState<AdminLeadDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedLeadForDocket, setSelectedLeadForDocket] = useState<AdminLeadDetail | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, leadsRes] = await Promise.all([
        fetchAdminStatsApi(),
        fetchAdminLeadsApi({
          q: searchQuery || undefined,
          status: selectedStatusFilter !== "ALL" ? selectedStatusFilter : undefined,
        }),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (leadsRes.success && leadsRes.leads) {
        setLeads(leadsRes.leads);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenLeadDocket = async (leadId: string) => {
    const res = await fetchAdminLeadDocketApi(leadId);
    if (res.success && res.lead) {
      setSelectedLeadForDocket(res.lead);
    }
  };

  const handleDeleteLead = async (leadId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete lead record for "${name}"?`)) return;

    const res = await deleteLeadApi(leadId);
    if (res.success) {
      setFeedbackToast(`Lead record for ${name} removed.`);
      loadData();
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = [
      "CRM_Ref_ID",
      "Customer_Name",
      "Mobile",
      "Email",
      "PAN_Number",
      "Credit_Score",
      "Total_Default_INR",
      "Subscribed_Plan",
      "Plan_Fee_Paid",
      "CIBIL_Fee_Paid",
      "Case_Status",
      "Assigned_Advisor",
      "Registered_Date",
    ];

    const rows = leads.map((l) => [
      l.crmReferenceId,
      `"${l.customerName}"`,
      l.mobile,
      l.email,
      l.panNumber,
      l.creditScore || 0,
      l.totalDefaultAmount || 0,
      `"${l.resolutionPackage || ""}"`,
      l.packageAmount || 0,
      l.cibilFee?.amount || 350,
      `"${l.caseStatus || ""}"`,
      `"${l.assignedAdvisor?.name || ""}"`,
      l.registrationDate,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Savrdh_CRM_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusFilterList = [
    { id: "ALL", label: "All Leads" },
    { id: "Under Legal Review", label: "Under Review" },
    { id: "Bank Communication Initiated", label: "Bank Notices" },
    { id: "OTS Negotiation Active", label: "OTS Negotiations" },
    { id: "Settlement Sanctioned", label: "Settled" },
    { id: "CIBIL Rectification Filed", label: "CIBIL Rectified" },
  ];

  return (
    <div className="min-h-screen bg-[#060A12] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-navy-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090F1C]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">SAVRDH LEGAL CRM</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Staff Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Official Desk: support@savrdhfinancialservices.com</p>
          </div>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToCustomerApp}
            className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 border border-slate-700 text-xs text-slate-200 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer View</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">{adminUser.name}</span>
            <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 font-mono">
              {adminUser.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Toast Notification */}
        {feedbackToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-600/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{feedbackToast}</span>
            </div>
            <button onClick={() => setFeedbackToast(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Leads */}
          <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800/90 shadow-lg shadow-black/40 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Lead Dockets</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {stats?.totalLeads ?? leads.length}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>{stats?.cibilProcuredCount ?? leads.length} CIBIL Audited</span>
            </div>
          </div>

          {/* Card 2: Total Default Under Resolution */}
          <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800/90 shadow-lg shadow-black/40 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Defaults Under Resolution</span>
              <Scale className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              ₹{((stats?.totalDefaultUnderResolution ?? 765000) / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[10px] text-slate-400">Scheduled for OTS & Bank Notice</div>
          </div>

          {/* Card 3: Revenue Collected */}
          <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800/90 shadow-lg shadow-black/40 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Revenue Collected</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ₹{(stats?.totalRevenueCollected ?? 17698).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400">Incl. ₹350 CIBIL fees & Legal Subscriptions</div>
          </div>

          {/* Card 4: Active Legal Disputes */}
          <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800/90 shadow-lg shadow-black/40 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Legal Disputes</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 font-mono">
              {stats?.activeDisputesCount ?? leads.length}
            </div>
            <div className="text-[10px] text-amber-400/80">Active advocate representations</div>
          </div>
        </div>

        {/* Action Header & Search Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#0A1120] border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Client Lead Dockets & Cases</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                  {leads.length} Records
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                View customer KYC documents, CIBIL reports, LOA authorization, and manage status
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Manual Lead</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
                title="Export all leads to Excel / CSV"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={loadData}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh leads list"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Customer Name, Mobile (e.g. 9876543210), PAN, Email, or Ref ID..."
                className="w-full pl-10 pr-20 py-2.5 bg-navy-950/90 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-500 text-navy-950 text-[11px] font-bold"
              >
                Search
              </button>
            </form>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {statusFilterList.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedStatusFilter(f.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStatusFilter === f.id
                      ? "bg-amber-500 text-navy-950 font-bold shadow-md shadow-amber-500/20"
                      : "bg-navy-950/80 hover:bg-navy-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads Table Card */}
        <div className="rounded-3xl bg-[#0A1120] border border-slate-800/80 overflow-hidden shadow-xl shadow-black/30">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading client dockets from encrypted vault...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Lead Records Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No customer leads matched your search query or filter criteria. Click "Add Manual Lead" or reset filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatusFilter("ALL");
                  loadData();
                }}
                className="py-1.5 px-4 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0D1527] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Customer & Ref ID</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">CIBIL & Defaults</th>
                    <th className="py-3.5 px-4">Subscribed Plan</th>
                    <th className="py-3.5 px-4">KYC & Docs</th>
                    <th className="py-3.5 px-4">Case Stage & Advisor</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leads.map((lead) => (
                    <tr
                      key={lead.leadId}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenLeadDocket(lead.leadId)}
                    >
                      {/* Customer Name & Ref */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                            {lead.customerName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                              <span>{lead.customerName}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">
                              {lead.crmReferenceId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-200 font-medium">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>+91 {lead.mobile}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-amber-400" />
                            <span>{lead.email}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 block">
                            PAN: {lead.panNumber}
                          </span>
                        </div>
                      </td>

                      {/* CIBIL & Overdue */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300 text-xs">
                              {lead.creditScore || "N/A"}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                (lead.creditScore || 0) < 650
                                  ? "bg-rose-950 text-rose-300"
                                  : "bg-emerald-950 text-emerald-300"
                              }`}
                            >
                              {lead.scoreBand || "Audited"}
                            </span>
                          </div>
                          <div className="text-[11px] text-rose-400 font-mono font-semibold">
                            ₹{(lead.totalDefaultAmount || 0).toLocaleString("en-IN")} default
                          </div>
                        </div>
                      </td>

                      {/* Subscribed Plan */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-white text-[11px] block truncate max-w-[160px]">
                            {lead.resolutionPackage || "Custom Package"}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/50">
                              Paid ₹{(lead.packageAmount || 9999).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* KYC Docs */}
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          <span
                            title={lead.panDocUrl ? "PAN Card Uploaded" : "PAN Document"}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono ${
                              lead.panDocUrl
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            PAN ✓
                          </span>
                          <span
                            title={lead.aadhaarFrontDocUrl ? "Aadhaar Uploaded" : "Aadhaar Card"}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono ${
                              lead.aadhaarFrontDocUrl
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            Aadhaar ✓
                          </span>
                          <span
                            title="Letter of Authority Signed"
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-mono"
                          >
                            LOA ✓
                          </span>
                        </div>
                      </td>

                      {/* Case Stage & Advisor */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60">
                            {lead.caseStatus || "Under Legal Review"}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {lead.assignedAdvisor?.name || "Adv. Vikram Malhotra"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenLeadDocket(lead.leadId)}
                            className="py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Docket</span>
                          </button>

                          <button
                            onClick={() => handleDeleteLead(lead.leadId, lead.customerName)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                            title="Delete Lead Docket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedLeadForDocket && (
        <LeadDocketModal
          lead={selectedLeadForDocket}
          isOpen={true}
          onClose={() => setSelectedLeadForDocket(null)}
          onLeadUpdated={() => {
            loadData();
            if (selectedLeadForDocket) {
              handleOpenLeadDocket(selectedLeadForDocket.leadId);
            }
          }}
        />
      )}

      {isCreateModalOpen && (
        <CreateManualLeadModal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          onLeadCreated={() => {
            setFeedbackToast("New client lead docket added successfully.");
            loadData();
            setTimeout(() => setFeedbackToast(null), 3000);
          }}
        />
      )}
    </div>
  );
};
