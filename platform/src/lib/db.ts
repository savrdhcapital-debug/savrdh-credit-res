import { Pool, type PoolClient } from "pg";
import type { Role } from "@/lib/rbac";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
});

export async function withDbActor<T>(
  actor: { userId: string; role: Role },
  work: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select set_config('app.user_id', $1, true)", [actor.userId]);
    await client.query("select set_config('app.role', $1, true)", [actor.role]);
    const result = await work(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export { pool };
