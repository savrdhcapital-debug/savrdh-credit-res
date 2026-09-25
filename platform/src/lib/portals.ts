import type { Role } from "@/lib/rbac";

export type PortalDefinition = {
  role: Role;
  label: string;
  path: string;
  modules: readonly string[];
};

export const PORTALS: Record<Role, PortalDefinition> = {
  customer: {
    role: "customer",
    label: "Customer Portal",
    path: "/portal/customer",
    modules: ["Profile", "Applications", "Documents", "Offers", "Sanctions", "Disbursements", "Notifications"]
  },
  partner: {
    role: "partner",
    label: "Partner Portal",
    path: "/portal/partner",
    modules: ["Referrals", "Applications", "Documents", "Referral Ledger", "Notifications"]
  },
  employee: {
    role: "employee",
    label: "Employee Portal",
    path: "/portal/employee",
    modules: ["Leads", "Applications", "Follow-ups", "Documents", "Tasks"]
  },
  credit: {
    role: "credit",
    label: "Credit Portal",
    path: "/portal/credit",
    modules: ["Credit Queue", "Financial Analysis", "Risk Flags", "Lender Matching", "Submissions"]
  },
  manager: {
    role: "manager",
    label: "Manager Portal",
    path: "/portal/manager",
    modules: ["Pipeline", "Assignments", "Approvals", "Team Analytics", "Escalations"]
  },
  finance: {
    role: "finance",
    label: "Finance Portal",
    path: "/portal/finance",
    modules: ["Verification Queue", "Disbursements", "Payments", "Commission Ledger", "Payouts", "Reconciliation"]
  },
  owner: {
    role: "owner",
    label: "Owner Portal",
    path: "/portal/owner",
    modules: ["Executive Dashboard", "All Applications", "Lenders", "Business Rules", "Audit", "Analytics", "Access"]
  },
  lender: {
    role: "lender",
    label: "Lender Portal",
    path: "/portal/lender",
    modules: ["Assigned Applications", "Queries", "Sanctions", "Status Updates"]
  }
};
