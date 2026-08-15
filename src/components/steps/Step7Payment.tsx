import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  Smartphone,
  Building,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Receipt,
  FileDown,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { ResolutionPackage, PaymentDetails, UserProfile } from "../../types";

interface Step7Props {
  packageSelected: ResolutionPackage;
  userProfile: UserProfile;
  onPaymentSuccess: (details: PaymentDetails) => void;
  onViewInvoice?: (details: PaymentDetails) => void;
}

export const Step7Payment: React.FC<Step7Props> = ({
  packageSelected,
  userProfile,
  onPaymentSuccess,
  onViewInvoice,
}) => {
  const [paymentMode, setPaymentMode] = useState<"UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING">("UPI");
  const [upiId, setUpiId] = useState("rajeshwar@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8912");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("892");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<PaymentDetails | null>(null);

  const basePrice = packageSelected.price;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstAmount;

  const handlePayNow = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#F59E0B", "#10B981", "#FFFFFF"],
        });
      } catch (e) {
        // ignore if iframe canvas blocks
      }

      const pDetails: PaymentDetails = {
        paymentId: `PAY_SVR_${Date.now()}`,
        orderId: `ORD_SVR_${Math.floor(100000 + Math.random() * 900000)}`,
        amount: basePrice,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
        paymentMethod: paymentMode,
        paymentStatus: "SUCCESS",
        paidAt: new Date().toISOString(),
        invoiceNumber: `SAV-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        selectedPackage: packageSelected,
      };

      setCompletedPayment(pDetails);
    }, 1800);
  };

  const handleProceedToCrm = () => {
    if (completedPayment) {
      onPaymentSuccess(completedPayment);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Step 7 of 8: Secure Payment Gateway</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Checkout & Invoice</h2>
        <p className="text-xs text-slate-400 mt-1">
          Savrdh Financial Services Private Limited (CIN: U67100UP2021PTC156235)
        </p>
      </div>

      {!paymentComplete ? (
        <div className="space-y-4">
          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl navy-card space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Selected Plan</span>
              <span className="text-xs font-bold text-amber-400">{packageSelected.title}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Resolution Professional Fee</span>
              <span className="font-mono text-slate-200">₹{basePrice.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Goods & Services Tax (18% GST)</span>
              <span className="font-mono text-slate-200">₹{gstAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-bold text-slate-100">
              <span>Total Payable Amount</span>
              <span className="font-mono text-amber-400 text-base">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-4 rounded-2xl navy-card space-y-3.5">
            <span className="text-xs font-semibold text-slate-300 block">Select Payment Mode</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode("UPI")}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                  paymentMode === "UPI"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-navy-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>UPI / QR / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("CREDIT_CARD")}
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                  paymentMode === "CREDIT_CARD"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-navy-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Credit / Debit Card</span>
              </button>
            </div>

            {/* UPI Details */}
            {paymentMode === "UPI" && (
              <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">UPI ID / VPA</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Instant Verification</span>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="mobile@upi"
                  className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">GPay</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">PhonePe</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">Paytm</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">BHIM</span>
                </div>
              </div>
            )}

            {/* Card Details */}
            {paymentMode === "CREDIT_CARD" && (
              <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2.5">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Card Number</span>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Valid Thru</span>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">CVV</span>
                    <input
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>256-Bit Encrypted Payment • PCI-DSS Certified</span>
          </div>

          {/* Pay Button */}
          <button
            id="btn-pay-now"
            type="button"
            disabled={isProcessing}
            onClick={handlePayNow}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Processing Payment of ₹{totalAmount.toLocaleString()}...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-navy-950" />
                <span>Pay ₹{totalAmount.toLocaleString()} & Generate Lead</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Payment Success & Receipt View */
        <div className="space-y-4">
          <div className="p-5 rounded-2xl navy-card-gold text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Payment Successful!</h3>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                Transaction ID: {completedPayment?.paymentId}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-3.5 rounded-xl bg-navy-950/90 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Invoice Number</span>
                <span className="font-mono text-amber-400 font-bold">
                  {completedPayment?.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Customer Name</span>
                <span className="text-slate-200 font-medium">{userProfile.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Resolution Plan</span>
                <span className="text-slate-200">{packageSelected.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount Paid (Incl. GST)</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{completedPayment?.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Date & Time</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>

            {onViewInvoice && completedPayment && (
              <button
                type="button"
                onClick={() => onViewInvoice(completedPayment)}
                className="w-full py-2.5 px-3 rounded-xl bg-navy-900 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>View / Download Official Tax Invoice & Receipt</span>
              </button>
            )}
          </div>

          <button
            id="btn-proceed-crm-lead"
            type="button"
            onClick={handleProceedToCrm}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-navy-950" />
            <span>Generate Lead in SAVRDH CRM & Assign Advisor</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
