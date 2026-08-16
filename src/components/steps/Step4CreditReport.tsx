import React, { useState } from "react";
import { ArrowRight, FileText, Info, ShieldCheck } from "lucide-react";
import { CreditBureauReport, KYCData } from "../../types";

interface Step4Props {
  kycData: KYCData;
  onProceedToAnalysis: (report: CreditBureauReport) => void;
  initialReport?: CreditBureauReport;
}

export const Step4CreditReport: React.FC<Step4Props> = ({ kycData, onProceedToAnalysis }) => {
  const [bureau, setBureau] = useState<CreditBureauReport["bureauName"]>("TransUnion CIBIL");
  const [score, setScore] = useState("");
  const [activeLoans, setActiveLoans] = useState("");
  const [cards, setCards] = useState("");
  const [overdue, setOverdue] = useState("");
  const [settled, setSettled] = useState("");
  const [writtenOff, setWrittenOff] = useState("");
  const [enquiries, setEnquiries] = useState("");
  const [utilization, setUtilization] = useState("");
  const [error, setError] = useState("");

  const num = (v: string) => Number(v || 0);
  const scoreBand = (s: number): CreditBureauReport["scoreBand"] => {
    if (s >= 750) return "Excellent";
    if (s >= 700) return "Good";
    if (s >= 650) return "Fair";
    return "Poor";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const scoreValue = num(score);
    if (scoreValue < 300 || scoreValue > 900) {
      setError("Enter the credit score shown on your report (300–900).");
      return;
    }

    const report: CreditBureauReport = {
      bureauName: bureau,
      score: scoreValue,
      scoreBand: scoreBand(scoreValue),
      reportDate: new Date().toISOString().slice(0, 10),
      controlNumber: "CUSTOMER-ENTERED",
      summary: {
        activeLoansCount: num(activeLoans),
        activeCreditCardsCount: num(cards),
        totalOutstanding: 0,
        totalOverdue: num(overdue),
        settledAccountsCount: num(settled),
        writtenOffAccountsCount: num(writtenOff),
        totalEnquiries: num(enquiries),
        creditUtilizationPercent: num(utilization),
        dpdInstances: 0,
      },
      accounts: [],
      enquiries: [],
    };
    onProceedToAnalysis(report);
  };

  const field = "w-full mt-1.5 px-3.5 py-3 rounded-xl bg-navy-950 border border-slate-700 text-sm text-slate-100 focus:border-amber-500 outline-none";

  return (
    <div className="p-5 max-w-md mx-auto space-y-5">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" /> Step 4 of 8: Credit Report
        </div>
        <h2 className="text-xl font-bold text-slate-100">Enter your credit report details</h2>
        <p className="text-xs text-slate-400 mt-1">For {kycData.fetchedProfile?.name || "this customer"}. No sample CIBIL report is displayed.</p>
      </div>

      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 flex gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Live bureau API is not connected on this test deployment yet. Enter values from your own latest credit report. SAVRDH will not claim a live bureau pull until a licensed bureau/aggregator integration is configured.</span>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="p-4 rounded-2xl navy-card space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Credit Bureau *
            <select value={bureau} onChange={(e) => setBureau(e.target.value as CreditBureauReport["bureauName"])} className={field}>
              <option>TransUnion CIBIL</option><option>Experian</option><option>Equifax</option><option>CRIF High Mark</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-300">Credit Score *<input inputMode="numeric" value={score} onChange={(e) => setScore(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 720" className={field} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-300">Active Loans<input inputMode="numeric" value={activeLoans} onChange={(e) => setActiveLoans(e.target.value.replace(/\D/g, ""))} className={field} /></label>
            <label className="block text-xs font-semibold text-slate-300">Credit Cards<input inputMode="numeric" value={cards} onChange={(e) => setCards(e.target.value.replace(/\D/g, ""))} className={field} /></label>
            <label className="block text-xs font-semibold text-slate-300">Settled Accounts<input inputMode="numeric" value={settled} onChange={(e) => setSettled(e.target.value.replace(/\D/g, ""))} className={field} /></label>
            <label className="block text-xs font-semibold text-slate-300">Written-Off Accounts<input inputMode="numeric" value={writtenOff} onChange={(e) => setWrittenOff(e.target.value.replace(/\D/g, ""))} className={field} /></label>
            <label className="block text-xs font-semibold text-slate-300">Recent Enquiries<input inputMode="numeric" value={enquiries} onChange={(e) => setEnquiries(e.target.value.replace(/\D/g, ""))} className={field} /></label>
            <label className="block text-xs font-semibold text-slate-300">Utilization %<input inputMode="numeric" value={utilization} onChange={(e) => setUtilization(e.target.value.replace(/\D/g, "").slice(0, 3))} className={field} /></label>
          </div>
          <label className="block text-xs font-semibold text-slate-300">Total Overdue Amount (₹)<input inputMode="numeric" value={overdue} onChange={(e) => setOverdue(e.target.value.replace(/\D/g, ""))} placeholder="0" className={field} /></label>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{error}</div>}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-400"><ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />These values are marked as customer-entered until a live bureau API is connected.</div>
        <button className="w-full py-3.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm flex items-center justify-center gap-2">Continue to Analysis <ArrowRight className="w-4 h-4" /></button>
      </form>
    </div>
  );
};
