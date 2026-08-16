import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "savrdh_credit_resolution";
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  return cachedClient.db(dbName);
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const mobile = String(body.mobile || "").replace(/\D/g, "").slice(-10);
    const customerName = String(body.customerName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!customerName || mobile.length !== 10 || !email) {
      return res.status(400).json({ success: false, message: "Customer name, valid mobile and email are required" });
    }

    const db = await getDb();
    const leads = db.collection("crm_leads");

    await leads.createIndex({ leadId: 1 }, { unique: true });
    await leads.createIndex({ mobile: 1, createdAt: -1 });
    await leads.createIndex({ paymentId: 1 }, { sparse: true });

    const now = new Date();
    const existing = body.paymentId
      ? await leads.findOne({ paymentId: body.paymentId })
      : null;

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Existing CRM lead found",
        lead: existing,
      });
    }

    const lead = {
      leadId: id("SAV-LEAD"),
      crmReferenceId: id("CRM"),
      customerName,
      mobile,
      email,
      aadhaarNumberMasked: body.aadhaarNumberMasked || "",
      panNumber: body.panNumber || "",
      dob: body.dob || "",
      gender: body.gender || "",
      address: body.address || "",
      creditScore: Number(body.creditScore || 0),
      creditBureau: body.creditBureau || "Customer Supplied",
      activeLoansCount: Number(body.activeLoansCount || 0),
      creditCardsCount: Number(body.creditCardsCount || 0),
      settledAccountsCount: Number(body.settledAccountsCount || 0),
      writtenOffAccountsCount: Number(body.writtenOffAccountsCount || 0),
      totalDefaultAmount: Number(body.totalDefaultAmount || 0),
      resolutionPackage: body.resolutionPackage || "",
      packageAmount: Number(body.packageAmount || 0),
      paymentId: body.paymentId || "",
      paymentStatus: body.paymentStatus || "SUCCESS",
      paymentDate: body.paymentDate || now.toISOString(),
      caseStatus: "NEW_LEAD",
      crmSyncStatus: "SYNCED",
      loaStatus: body.loaStatus || "PENDING_EXECUTION",
      loaReferenceNumber: body.loaReferenceNumber || "",
      loaConsentTimestamp: body.loaConsentTimestamp || "",
      source: "SAVRDH_CREDIT_RESOLUTION_APP",
      registrationDate: now.toISOString(),
      syncedAt: now.toISOString(),
      createdAt: now,
      updatedAt: now,
    };

    await leads.insertOne(lead);

    return res.status(201).json({
      success: true,
      message: "CRM lead created and stored in MongoDB",
      lead,
    });
  } catch (error: any) {
    console.error("CRM create-lead error", error);
    return res.status(500).json({
      success: false,
      message: error?.message === "MONGODB_URI is not configured"
        ? "CRM database is not configured. Add MONGODB_URI in Vercel Environment Variables."
        : "CRM lead could not be stored",
    });
  }
}
