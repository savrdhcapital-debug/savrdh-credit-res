import crypto from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const apiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
  const otpId = process.env.FAST2SMS_OTP_ID;
  const mobile = String(req.body?.mobile || "").replace(/\D/g, "").slice(-10);
  const otp = String(req.body?.mobileOtp || "").replace(/\D/g, "");

  if (mobile.length !== 10 || otp.length < 4) {
    return res.status(400).json({ success: false, message: "Valid mobile number and OTP are required" });
  }

  // Test mode is only used while DLT / Fast2SMS Smart OTP is not fully configured.
  if (!apiKey || !otpId) {
    if (otp !== "9999") {
      return res.status(400).json({ success: false, message: "Invalid test OTP. Use 9999 for preview testing." });
    }
    return res.status(200).json({
      success: true,
      message: "Mobile number verified in test mode",
      authToken: `svrdh_test_${Date.now()}_${crypto.randomUUID()}`,
      testMode: true,
    });
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/otp/verify", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile, otp }),
    });

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok || data?.return === false) {
      return res.status(response.status >= 400 ? response.status : 400).json({
        success: false,
        message: data?.message || "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mobile number verified successfully",
      authToken: `svrdh_${Date.now()}_${crypto.randomUUID()}`,
    });
  } catch (error) {
    console.error("Fast2SMS verify OTP error", error);
    return res.status(502).json({ success: false, message: "OTP verification service is temporarily unavailable" });
  }
}
