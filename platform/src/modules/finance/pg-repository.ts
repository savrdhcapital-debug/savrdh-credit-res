import type { PoolClient } from "pg";
import type { FinanceRepository, FinancialTransaction } from "./service";

function map(row: Record<string, unknown>): FinancialTransaction {
  return {
    id: String(row.id),
    applicationId: String(row.application_id),
    transactionType: row.transaction_type as FinancialTransaction["transactionType"],
    amount: Number(row.amount),
    utrOrTransactionId: String(row.utr_or_transaction_id),
    status: row.status as FinancialTransaction["status"]
  };
}

export class PgFinanceRepository implements FinanceRepository {
  constructor(private readonly client: PoolClient) {}

  async createPendingTransaction(input: Omit<FinancialTransaction, "id" | "status">) {
    const result = await this.client.query(
      `insert into scp_financial_transactions(
        application_id, transaction_type, amount, utr_or_transaction_id, created_by
      ) values ($1,$2,$3,$4,scp_current_user_id()) returning *`,
      [input.applicationId, input.transactionType, input.amount, input.utrOrTransactionId]
    );
    return map(result.rows[0]);
  }

  async verifyTransaction(transactionId: string, financeUserId: string, notes?: string) {
    const result = await this.client.query(
      "select * from scp_verify_transaction($1,$2,$3)",
      [transactionId, financeUserId, notes ?? null]
    );
    return map(result.rows[0]);
  }
}
