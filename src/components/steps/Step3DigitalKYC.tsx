import React, { useRef, useState } from "react";
import { ArrowRight, FileCheck2, ShieldCheck, Upload } from "lucide-react";
import { KYCData, UserProfile } from "../../types";

interface Step3Props {
  userProfile: UserProfile;
  onComplete: (kycData: KYCData) => void;
  initialKYC?: KYCData;
}

type Uploaded = { name: string; url: string } | null;

export const Step3DigitalKYC: React.FC<Step3Props> = ({ userProfile, onComplete, initialKYC }) => {
  const [fullName, setFullName] = useState(initialKYC?.fetchedProfile?.name || userProfile.fullName || "");
  const [dob, setDob] = useState(initialKYC?.fetchedProfile?.dob || "");
  const [gender, setGender] = useState(initialKYC?.fetchedProfile?.gender || "");
  const [fatherName, setFatherName] = useState(initialKYC?.fetchedProfile?.fatherName || "");
  const [address, setAddress] = useState(initialKYC?.fetchedProfile?.address || "");
  const [panNumber, setPanNumber] = useState(initialKYC?.panNumber || "");
  const [aadhaar, setAadhaar] = useState(initialKYC?.aadhaarNumber || "");
  const [panFile, setPanFile] = useState<Uploaded>(null);
  const [aadhaarFront, setAadhaarFront] = useState<Uploaded>(null);
  const [aadhaarBack, setAadhaarBack] = useState<Uploaded>(null);
  const [error, setError] = useState("");

  const panRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File, setter: (v: Uploaded) => void) => {
    const reader = new FileReader();
    reader.onload = () => setter({ name: file.name, url: typeof reader.result === "string" ? reader.result : "" });
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) return setError("Full name is required.");
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(panNumber.trim())) return setError("Enter a valid PAN number.");
    if (!/^\d{12}$/.test(aadhaar)) return setError("Enter a valid 12-digit Aadhaar number.");
    if (!dob || !gender || !address.trim()) return setError("Please complete DOB, gender and address.");
    if (!panFile || !aadhaarFront) return setError("Please upload PAN and Aadhaar front documents.");

    const result: KYCData = {
      aadhaarNumber: aadhaar,
      maskedAadhaar: `XXXX-XXXX-${aadhaar.slice(-4)}`,
      panNumber: panNumber.trim().toUpperCase(),
      isVerified: false,
      verifiedAt: undefined,
      kycMethod: "DOCUMENT_UPLOAD",
      kycProvider: "Savrdh manual document review",
      referenceId: `KYC-SVR-${Date.now()}`,
      panDocUrl: panFile.url,
      panDocName: panFile.name,
      aadhaarFrontDocUrl: aadhaarFront.url,
      aadhaarFrontDocName: aadhaarFront.name,
      aadhaarBackDocUrl: aadhaarBack?.url,
      aadhaarBackDocName: aadhaarBack?.name,
      fetchedProfile: {
        name: fullName.trim(),
        dob,
        gender,
        fatherName: fatherName.trim(),
        address: address.trim(),
        photoUrl: "",
      },
    };
    onComplete(result);
  };

  const field = "w-full mt-1.5 px-3.5 py-3 rounded-xl bg-navy-950 border border-slate-700 text-sm text-slate-100 focus:border-amber-500 outline-none";

  return (
    <div className="p-5 max-w-md mx-auto space-y-5">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Step 3 of 8: KYC Documents
        </div>
        <h2 className="text-xl font-bold text-slate-100">Submit your KYC details</h2>
        <p className="text-xs text-slate-400 mt-1">Only your entered information and uploaded documents will be used. Nothing is pre-filled with demo identity data.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="p-4 rounded-2xl navy-card space-y-3">
          <label className="block text-xs font-semibold text-slate-300">Full Name *<input className={field} value={fullName} onChange={(e) => setFullName(e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-300">Date of Birth *<input type="date" className={field} value={dob} onChange={(e) => setDob(e.target.value)} /></label>
            <label className="block text-xs font-semibold text-slate-300">Gender *<select className={field} value={gender} onChange={(e) => setGender(e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></label>
          </div>
          <label className="block text-xs font-semibold text-slate-300">Father / Guardian Name<input className={field} value={fatherName} onChange={(e) => setFatherName(e.target.value)} /></label>
          <label className="block text-xs font-semibold text-slate-300">PAN Number *<input className={field} maxLength={10} value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} placeholder="ABCDE1234F" /></label>
          <label className="block text-xs font-semibold text-slate-300">Aadhaar Number *<input className={field} inputMode="numeric" maxLength={12} value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))} placeholder="12-digit Aadhaar" /></label>
          <label className="block text-xs font-semibold text-slate-300">Address *<textarea className={`${field} min-h-20`} value={address} onChange={(e) => setAddress(e.target.value)} /></label>
        </div>

        <div className="p-4 rounded-2xl navy-card space-y-3">
          <p className="text-xs font-semibold text-slate-200 flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-amber-400" />Upload documents</p>
          <input ref={panRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], setPanFile)} />
          <input ref={frontRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], setAadhaarFront)} />
          <input ref={backRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0], setAadhaarBack)} />
          <button type="button" onClick={() => panRef.current?.click()} className="w-full p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between"><span>{panFile?.name || "Upload PAN card"}</span><Upload className="w-4 h-4 text-amber-400" /></button>
          <button type="button" onClick={() => frontRef.current?.click()} className="w-full p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between"><span>{aadhaarFront?.name || "Upload Aadhaar front"}</span><Upload className="w-4 h-4 text-amber-400" /></button>
          <button type="button" onClick={() => backRef.current?.click()} className="w-full p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between"><span>{aadhaarBack?.name || "Upload Aadhaar back (optional)"}</span><Upload className="w-4 h-4 text-amber-400" /></button>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{error}</div>}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">Documents are submitted for review; this test build does not claim UIDAI/PAN verification until a production KYC provider is integrated.</div>
        <button className="w-full py-3.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm flex items-center justify-center gap-2">Continue to Credit Report <ArrowRight className="w-4 h-4" /></button>
      </form>
    </div>
  );
};
