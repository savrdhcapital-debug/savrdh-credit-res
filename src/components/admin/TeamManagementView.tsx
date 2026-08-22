import React, { useState } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  Scale,
  Award,
  Search,
  Building2,
  UserCheck,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { TeamMember } from "../../types";
import {
  createAdminTeamMemberApi,
  updateAdminTeamMemberApi,
  deleteAdminTeamMemberApi,
} from "../../services/api";

interface TeamManagementViewProps {
  team: TeamMember[];
  isLoading: boolean;
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

const ROLE_CONFIG: Record<
  TeamMember["role"],
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  LEGAL_ADVOCATE: {
    label: "Legal Counsel & Advocate",
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/40",
    icon: Scale,
  },
  CASE_OFFICER: {
    label: "Senior Case Officer",
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/40",
    icon: Briefcase,
  },
  OTS_NEGOTIATOR: {
    label: "OTS Settlement Negotiator",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    icon: Award,
  },
  NODAL_OFFICER: {
    label: "Nodal Escalation Officer",
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/40",
    icon: ShieldCheck,
  },
  CREDIT_ANALYST: {
    label: "Credit Bureau Analyst",
    bg: "bg-cyan-500/15",
    text: "text-cyan-300",
    border: "border-cyan-500/40",
    icon: Sparkles,
  },
};

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  team,
  isLoading,
  onRefresh,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    name: string;
    role: TeamMember["role"];
    designation: string;
    phone: string;
    email: string;
    barCouncilNumber: string;
    employeeId: string;
    experienceYears: number;
    casesResolved: number;
    rating: number;
    photo: string;
    status: "ACTIVE" | "INACTIVE";
    isDefault: boolean;
    department: string;
    notes: string;
  }>({
    name: "",
    role: "LEGAL_ADVOCATE",
    designation: "",
    phone: "+91 8109995906",
    email: "support@savrdhfinancialservices.com",
    barCouncilNumber: "",
    employeeId: "",
    experienceYears: 6,
    casesResolved: 250,
    rating: 4.9,
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    isDefault: false,
    department: "Legal & Credit Resolution Desk",
    notes: "",
  });

  const openAddModal = () => {
    setFormData({
      name: "",
      role: "LEGAL_ADVOCATE",
      designation: "Credit Resolution Specialist & Advocate",
      phone: "+91 8109995906",
      email: "support@savrdhfinancialservices.com",
      barCouncilNumber: "BCI/DEL/2026/001",
      employeeId: `SAV-EMP-${Math.floor(105 + Math.random() * 800)}`,
      experienceYears: 6,
      casesResolved: 150,
      rating: 4.9,
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
      status: "ACTIVE",
      isDefault: team.length === 0,
      department: "Legal & Credit Disputes",
      notes: "",
    });
    setEditingMember(null);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      designation: member.designation,
      phone: member.phone,
      email: member.email,
      barCouncilNumber: member.barCouncilNumber || "",
      employeeId: member.employeeId || "",
      experienceYears: member.experienceYears || 5,
      casesResolved: member.casesResolved || 0,
      rating: member.rating || 4.9,
      photo: member.photo,
      status: member.status,
      isDefault: member.isDefault,
      department: member.department || "Legal & Credit Disputes",
      notes: member.notes || "",
    });
    setEditingMember(member);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Employee name is required.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingMember) {
        // Update existing
        const res = await updateAdminTeamMemberApi(editingMember.id, formData);
        if (res.success) {
          onShowToast(`Employee "${formData.name}" successfully updated.`);
          setIsAddModalOpen(false);
          onRefresh();
        } else {
          setFormError(res.message || "Failed to update employee.");
        }
      } else {
        // Create new
        const res = await createAdminTeamMemberApi(formData);
        if (res.success) {
          onShowToast(`Employee "${formData.name}" successfully added to Savrdh Team.`);
          setIsAddModalOpen(false);
          onRefresh();
        } else {
          setFormError(res.message || "Failed to add employee.");
        }
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakeDefault = async (member: TeamMember) => {
    if (member.isDefault) return;
    try {
      const res = await updateAdminTeamMemberApi(member.id, { isDefault: true });
      if (res.success) {
        onShowToast(`"${member.name}" set as Default Auto-Assignee for all new client leads.`);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await updateAdminTeamMemberApi(member.id, { status: newStatus });
      if (res.success) {
        onShowToast(`"${member.name}" status changed to ${newStatus}.`);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await deleteAdminTeamMemberApi(memberToDelete.id);
      if (res.success) {
        onShowToast(res.message);
        setMemberToDelete(null);
        onRefresh();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter team
  const filteredTeam = team.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.barCouncilNumber && m.barCouncilNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.employeeId && m.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.phone.includes(searchQuery) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRoleFilter === "ALL" || m.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalActive = team.filter((m) => m.status === "ACTIVE").length;
  const defaultMember = team.find((m) => m.isDefault);
  const totalCasesHandled = team.reduce((acc, curr) => acc + (curr.casesResolved || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Officers & Staff</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{team.length}</div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{totalActive} Active Duty</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Default Lead Assignee</span>
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300 truncate">
            {defaultMember?.name || "Not Configured"}
          </div>
          <div className="text-[10px] text-slate-400">Auto-receives new customer registrations</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Historical Cases Resolved</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {totalCasesHandled.toLocaleString("en-IN")}+
          </div>
          <div className="text-[10px] text-slate-400">Across Bank OTS & CICRA disputes</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1324] border border-slate-800 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Legal Representation Desk</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-slate-200">SAVRDH Dispute Wing</div>
          <div className="text-[10px] text-slate-400 font-mono">CIN: U67100UP2021PTC156235</div>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0A1120] border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Company Employees & Assigned Case Officers</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                {team.length} Members
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Add, edit, or remove resolution advocates and case managers. Assign default representatives for new customer dockets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee / Officer</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh Team List"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search and Role Filter Chips */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Employee Name, Designation, Bar Registration, Phone, or Emp ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-navy-950/90 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All Departments" },
              { id: "LEGAL_ADVOCATE", label: "Advocates" },
              { id: "CASE_OFFICER", label: "Case Officers" },
              { id: "OTS_NEGOTIATOR", label: "OTS Negotiators" },
              { id: "NODAL_OFFICER", label: "Nodal Officers" },
              { id: "CREDIT_ANALYST", label: "Bureau Analysts" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedRoleFilter(f.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRoleFilter === f.id
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

      {/* Team Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading company employees & assigned legal desk...</p>
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-[#0A1120] border border-slate-800 rounded-3xl p-6">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Employees Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No team members matched your search criteria. Click "Add Employee / Officer" to onboard a new representative.
          </p>
          <button
            onClick={openAddModal}
            className="py-2 px-4 rounded-xl bg-amber-500 text-navy-950 font-bold text-xs"
          >
            Add First Employee
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map((member) => {
            const roleCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.LEGAL_ADVOCATE;
            const RoleIcon = roleCfg.icon;

            return (
              <div
                key={member.id}
                className={`relative rounded-3xl bg-[#0B1324] border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xl ${
                  member.isDefault
                    ? "border-amber-500/50 shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-slate-800/80 hover:border-slate-700"
                } ${member.status === "INACTIVE" ? "opacity-60" : ""}`}
              >
                {/* Top Accent Pill */}
                {member.isDefault && (
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-navy-950 px-3 py-0.5 text-[10px] font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <UserCheck className="w-3 h-3" />
                    <span>DEFAULT AUTO-ASSIGNEE (NEW LEADS)</span>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Officer Header */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={member.photo}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-amber-500/30 flex-shrink-0 bg-slate-800 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-white text-sm truncate">{member.name}</h3>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            member.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300/90 font-medium truncate mt-0.5">
                        {member.designation}
                      </p>

                      <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleCfg.bg} ${roleCfg.text} ${roleCfg.border}">
                        <RoleIcon className="w-3 h-3" />
                        <span>{roleCfg.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Creds */}
                  <div className="p-3 rounded-2xl bg-navy-950/80 border border-slate-800/80 space-y-2 text-[11px]">
                    {member.barCouncilNumber && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Bar Registration:</span>
                        <span className="font-mono text-slate-200 font-semibold">{member.barCouncilNumber}</span>
                      </div>
                    )}
                    {member.employeeId && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Employee Code:</span>
                        <span className="font-mono text-amber-300 font-semibold">{member.employeeId}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Experience & Track:</span>
                      <span className="text-slate-200">
                        {member.experienceYears} Years • {member.casesResolved}+ Cases
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Customer Rating:</span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {member.rating} / 5.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Active Lead Dockets:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {member.activeCasesCount || 0} Cases
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
                      <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="font-mono">{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
                      <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>

                  {member.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-navy-950/50 p-2 rounded-xl border border-slate-800/50">
                      "{member.notes}"
                    </p>
                  )}
                </div>

                {/* Card Bottom Controls */}
                <div className="p-3 bg-[#080E1B] border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {!member.isDefault && member.status === "ACTIVE" && (
                      <button
                        onClick={() => handleMakeDefault(member)}
                        className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Set as auto-assignee for all newly registered leads"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`py-1.5 px-2.5 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                        member.status === "ACTIVE"
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                          : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {member.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="Edit Employee Information"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setMemberToDelete(member)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0A1120] border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 text-slate-100 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500" />

            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  {editingMember ? "Edit Employee / Case Officer" : "Add New Employee / Case Officer"}
                </h2>
                <p className="text-xs text-slate-400">
                  Configure corporate credentials, designation, contact, and lead assignment rules.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name & Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Adv. Vikram Malhotra / Sunita Rao"
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department / Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamMember["role"] })}
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  >
                    <option value="LEGAL_ADVOCATE">Legal Counsel & Advocate</option>
                    <option value="CASE_OFFICER">Senior Case Resolution Officer</option>
                    <option value="OTS_NEGOTIATOR">OTS Settlement Negotiator</option>
                    <option value="NODAL_OFFICER">Nodal Escalation Officer</option>
                    <option value="CREDIT_ANALYST">Credit Bureau Analyst</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Designation Label *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior Credit Resolution Specialist & Legal Advisor"
                  className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Official Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 8109995906"
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="support@savrdhfinancialservices.com"
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bar Council / Reg Number</label>
                  <input
                    type="text"
                    value={formData.barCouncilNumber}
                    onChange={(e) => setFormData({ ...formData, barCouncilNumber: e.target.value })}
                    placeholder="e.g. BCI/MAH/2849/2012"
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. SAV-EMP-105"
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Exp (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cases Handled</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.casesResolved}
                    onChange={(e) => setFormData({ ...formData, casesResolved: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Rating (/5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Profile Photo URL</label>
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                    className="w-full py-2 px-3 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (On-Duty)</option>
                    <option value="INACTIVE">INACTIVE (Off-Duty)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 bg-navy-950 border-slate-700 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-200 font-semibold">Set as Default Lead Assignee</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Internal Notes & Specialization</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Lead advocate for Lok Adalat, Section 138 petitions & multi-lender OTS."
                  className="w-full p-2.5 bg-navy-950 border border-slate-700 focus:border-amber-400 rounded-xl text-white placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-navy-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{editingMember ? "Save Changes" : "Add Employee"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0A1120] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Remove Employee Record?</h2>
                <p className="text-xs text-slate-400">This action will remove the officer from active roster.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-navy-950 p-3 rounded-xl border border-slate-800">
              Are you sure you want to remove <strong className="text-amber-300">{memberToDelete.name}</strong> ({memberToDelete.designation})? Any active leads assigned to this officer will be automatically reassigned to the default desk.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
