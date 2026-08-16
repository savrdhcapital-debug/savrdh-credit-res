export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const hasApiKey = Boolean(process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY);
  const hasOtpId = Boolean(process.env.FAST2SMS_OTP_ID);
  const isConfigured = hasApiKey && hasOtpId;

  return res.status(200).json({
    isConfigured,
    activeProvider: isConfigured ? "Fast2SMS" : "Unavailable",
    senderId: process.env.SMS_SENDER_ID || "SAVRDH",
    message: isConfigured
      ? "Fast2SMS live OTP gateway is configured"
      : "Add FAST2SMS_API_KEY and FAST2SMS_OTP_ID in Vercel Environment Variables",
  });
}
