import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "savrdh_credit_resolution";
  if (!uri) {
    return res.status(503).json({ status: "not_configured", message: "MONGODB_URI is missing" });
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }
    const db = cachedClient.db(dbName);
    await db.command({ ping: 1 });
    const leadCount = await db.collection("crm_leads").countDocuments();
    return res.status(200).json({
      status: "ok",
      database: dbName,
      collection: "crm_leads",
      leadCount,
    });
  } catch (error) {
    console.error("CRM health error", error);
    return res.status(503).json({ status: "error", message: "MongoDB connection failed" });
  }
}
