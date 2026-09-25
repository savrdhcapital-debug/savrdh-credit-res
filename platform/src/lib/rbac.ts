export const ROLES = [
  "customer",
  "partner",
  "employee",
  "credit",
  "manager",
  "finance",
  "owner",
  "lender"
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  customer: [
    "application:create",
    "application:view:self",
    "document:upload:self",
    "profile:update:self"
  ],
  partner: [
    "referral:create",
    "referral:view:self",
    "application:view:referred",
    "document:upload:referred"
  ],
  employee: [
    "lead:view:assigned",
    "lead:update:assigned",
    "application:create:on_behalf",
    "application:update:assigned",
    "document:upload:assigned"
  ],
  credit: [
    "credit_analysis:create",
    "credit_analysis:verify",
    "lender_match:create",
    "application:submit_to_lender"
  ],
  manager: [
    "lead:assign",
    "application:review",
    "workflow:override_non_financial",
    "analytics:view:team"
  ],
  finance: [
    "payment:verify",
    "disbursement:verify",
    "transaction:reconcile",
    "commission:approve",
    "payout:process"
  ],
  owner: ["*"],
  lender: [
    "lender_application:view:own",
    "lender_application:update:own"
  ]
} as const satisfies Record<Role, readonly string[]>;

export function can(role: Role, permission: string): boolean {
  const permissions = PERMISSIONS[role] as readonly string[];
  return permissions.includes("*") || permissions.includes(permission);
}

export const FINANCE_ONLY = new Set([
  "payment:verify",
  "disbursement:verify",
  "transaction:reconcile",
  "commission:approve",
  "payout:process"
]);

export function assertPermission(role: Role, permission: string): void {
  if (!can(role, permission)) {
    throw new Error(`Forbidden: ${role} cannot ${permission}`);
  }
}
