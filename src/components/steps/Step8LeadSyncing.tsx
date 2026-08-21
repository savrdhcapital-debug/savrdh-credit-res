import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  Scale,
  Award,
  FileDown
} from "lucide-react";
import {
  UserProfile,
  KYCData,
  CreditBureauReport,
  ResolutionPackage,
  PaymentDetails,
  CRMLeadRecord,
  AssignedAdvisor
} from "../../types";
import { ASSIGNED_ADVISOR } from "../../data/mockData";
import { syncLeadToCrm } from "../../services/api";

interface Step8Props {
  userProfile: UserProfile;
  kycData: KYCData;
  creditReport: CreditBureauReport;
  packageSelected: ResolutionPackage;
  paymentDetails: PaymentDetails;
  onLeadSynced: (lead: CRMLeadRecord, advisor: AssignedAdvisor) => void;
  onViewLoa?: () => void;
}

export const Step8LeadSyncing: React.FC<Step8Props> = ({
  userProfile,
  kycData,
  creditReport,
  packageSelected,
  paymentDetails,
  onLeadSynced,
  onViewLoa,
}) => {
  const [syncState, setSyncState] = useState<"SYNCING" | "LEAD_CREATED" | "ADVISOR_ASSIGNED">("SYNCING");
  const [crmLead, setCrmLead] = useState<CRMLeadRecord | null>(null);
  const [advisor] = useState<AssignedAdvisor>(ASSIGNED_ADVISOR);

  useEffect(() => {
    let isMounted = true;

    const performSync = async () => {
      // Step 1: Push Lead to CRM API
      const result = await syncLeadToCrm({
        userProfile,
        kycData,
        creditReport,
        packageSelected,
        paymentId: paymentDetails.paymentId,
      });

      if (!isMounted) return;
      setCrmLead(result.lead);
      setSyncState("LEAD_CREATED");

      // Step 2: Auto-assign Advisor in CRM
      setTimeout(() => {
        if (!isMounted) return;
        setSyncState("ADVISOR_ASSIGNED");
      }, 1400);
    };

    performSync();

    return () => {
      isMounted = false;
    };
  }, [userProfile, kycData, creditReport, packageSelected, paymentDetails]);

  const handleOpenDashboard = () => {
    if (crmLead) {
      onLeadSynced(crmLead, advisor);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Step 8 & 9: Real-time CRM Sync & Advisor Assignment</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Automatic CRM Ingestion</h2>
        <p className="text-xs text-slate-400 mt-1">
          Generating enterprise resolution lead inside SAVRDH Central CRM with zero manual delay.
        </p>
      </div>

      <div className="space-y-4">
        {/* Letter of Authority & Legal Consent Card */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                Letter of Authority (LOA) & Legal Consent
              </span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              E-SIGNED & ATTACHED
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Formally authorizes <strong className="text-slate-100">Savrdh Financial Services Pvt. Ltd.</strong> and panel advocates to access your credit files (CIBIL, Experian) and legally represent you in One-Time Settlement (OTS) disputes with Banks & NBFCs.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/20 text-[10px]">
            <span className="text-slate-400">
              Ref: <span className="font-mono text-amber-300">{crmLead?.loaReferenceNumber || "SAV-LOA-2026-8941"}</span>
            </span>
            <div className="flex items-center gap-3">
              {onViewLoa && (
                <button
                  type="button"
                  onClick={onViewLoa}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Preview LOA
                </button>
              )}
              <a
                href={`/api/consent/download-loa-pdf?name=${encodeURIComponent(userProfile.fullName)}&pan=${encodeURIComponent(kycData.panNumber || "")}&aadhaar=${encodeURIComponent(kycData.maskedAadhaar || "")}&ref=${encodeURIComponent(crmLead?.loaReferenceNumber || "SAV-LOA-2026")}&mobile=${encodeURIComponent(userProfile.mobile)}&email=${encodeURIComponent(userProfile.email || "")}&address=${encodeURIComponent(kycData.fetchedProfile?.address || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
              >
                <FileDown className="w-3 h-3" />
                Download PDF
              </a>
            </div>
          </div>
        </div>

        {/* Sync Progress Pipeline Card */}
        <div className="p-4 rounded-2xl navy-card space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Automated Pipeline Status</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {syncState === "SYNCING"
                ? "Connecting Webhook..."
                : syncState === "LEAD_CREATED"
                ? "Lead Created"
                : "Advisor Assigned"}
            </span>
          </div>

          <div className="space-y-3">
            {/* Step A */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Customer eKYC & Credit Audit Archived</p>
                <p className="text-[10px] text-slate-400">Aadhaar {kycData.maskedAadhaar} • Score {creditReport.score}</p>
              </div>
            </div>

            {/* Step B */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  syncState !== "SYNCING"
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                    : "bg-amber-500/20 border border-amber-500 text-amber-400"
                }`}
              >
                {syncState !== "SYNCING" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200">SAVRDH CRM Lead Ingestion</p>
                <p className="text-[10px] text-slate-400">
                  {crmLead ? `Ref ID: ${crmLead.crmReferenceId} • Lead: ${crmLead.leadId}` : "Syncing customer payload to CRM database..."}
                </p>
              </div>
            </div>

            {/* Step C */}
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  syncState === "ADVISOR_ASSIGNED"
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                    : "bg-navy-900 border border-slate-700 text-slate-500"
                }`}
              >
                {syncState === "ADVISOR_ASSIGNED" ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Legal Advisor Assigned</p>
                <p className="text-[10px] text-slate-400">Adv. Vikram Malhotra (Senior Credit Resolution Specialist)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Advisor Card */}
        {syncState === "ADVISOR_ASSIGNED" && (
          <div className="p-4 rounded-2xl navy-card-gold space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">Your Appointed Resolution Advocate</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                Assigned
              </span>
            </div>

            <div className="flex items-start gap-3.5">
              <img
                src={advisor.photo}
                alt={advisor.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-amber-500/40 flex-shrink-0"
              />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-100 text-sm">{advisor.name}</h4>
                <p className="text-[11px] text-amber-300 font-medium">{advisor.designation}</p>
                <p className="text-[10px] text-slate-400">
                  Reg No: <span className="font-mono text-slate-300">{advisor.barCouncilNumber}</span>
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                  <span>★ {advisor.rating} / 5.0</span>
                  <span>•</span>
                  <span>{advisor.casesResolved}+ Cases Resolved</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Direct Case Hotline:</span>
              <span className="font-mono text-amber-300 font-semibold">{advisor.phone}</span>
            </div>
          </div>
        )}

        {/* Proceed to Dashboard Button */}
        {syncState === "ADVISOR_ASSIGNED" && (
          <button
            id="btn-open-dashboard"
            type="button"
            onClick={handleOpenDashboard}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Customer Resolution Dashboard</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
