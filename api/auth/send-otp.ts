export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const apiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
  const otpId = process.env.FAST2SMS_OTP_ID;

  if (!apiKey || !otpId) {
    return res.status(503).json({
      success: false,
      message: "Live SMS gateway is not configured. Add FAST2SMS_API_KEY and FAST2SMS_OTP_ID in Vercel Environment Variables.",
    });
  }

  const mobile = String(req.body?.mobile || "").replace(/\D/g, "").slice(-10);
  if (mobile.length !== 10) {
    return res.status(400).json({ success: false, message: "Valid 10-digit mobile number is required" });
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/otp/send", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile,
        otp_id: otpId,
        otp_length: 6,
        otp_expiry: 10,
      }),
    });

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok || data?.return === false) {
      return res.status(response.status >= 400 ? response.status : 502).json({
        success: false,
        message: data?.message || "Fast2SMS could not dispatch the OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent to +91 ${mobile}`,
      mobile,
      expiresInSeconds: 600,
      isLiveSmsSent: true,
      provider: "Fast2SMS",
    });
  } catch (error) {
    console.error("Fast2SMS send OTP error", error);
    return res.status(502).json({ success: false, message: "OTP provider is temporarily unavailable" });
  }
}
