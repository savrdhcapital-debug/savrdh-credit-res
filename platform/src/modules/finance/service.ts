import { assertPermission, type Role } from "@/lib/rbac";

export type FinancialTransaction = {
  id: string;
  applicationId: string;
  transactionType:
    | "customer_payment"
    | "lender_disbursement"
    | "refund"
    | "commission_payout"
    | "adjustment";
  amount: number;
  utrOrTransactionId: string;
  status: "pending" | "verified" | "rejected" | "reversed";
};

export interface FinanceRepository {
  createPendingTransaction(input: Omit<FinancialTransaction, "id" | "status">): Promise<FinancialTransaction>;
  verifyTransaction(transactionId: string, financeUserId: string, notes?: string): Promise<FinancialTransaction>;
}

/**
 * UI cannot change status directly. Every verification must call the DB
 * verification function through this service boundary.
 */
export async function verifyFinancialTransaction(args: {
  role: Role;
  financeUserId: string;
  transactionId: string;
  notes?: string;
  repo: FinanceRepository;
}) {
  assertPermission(args.role, "payment:verify");
  return args.repo.verifyTransaction(
    args.transactionId,
    args.financeUserId,
    args.notes
  );
}

/**
 * Employees/partners may submit evidence, but the resulting record stays pending.
 */
export async function recordTransactionEvidence(args: {
  role: Role;
  input: Omit<FinancialTransaction, "id" | "status">;
  repo: FinanceRepository;
}) {
  const allowed = new Set<Role>([
    "employee","partner","credit","manager","finance","owner"
  ]);
  if (!allowed.has(args.role)) throw new Error("Forbidden");
  return args.repo.createPendingTransaction(args.input);
}
