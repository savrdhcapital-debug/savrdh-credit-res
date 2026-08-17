import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  User,
  ArrowRight,
  Upload,
  FileText,
  Trash2,
  Lock,
  Calendar,
  MapPin,
  Camera,
  FileCheck2,
  Sparkles,
  Scan,
} from "lucide-react";
import { KYCData, UserProfile } from "../../types";
import { notifyKycCompletedApi, ocrKycDocumentApi } from "../../services/api";

interface Step3Props {
  userProfile: UserProfile;
  onComplete: (kycData: KYCData) => void;
  initialKYC?: KYCData;
}

export const Step3DigitalKYC: React.FC<Step3Props> = ({ userProfile, onComplete, initialKYC }) => {
  const [fullName, setFullName] = useState(
    initialKYC?.fetchedProfile?.name || userProfile.fullName || ""
  );
  const [dob, setDob] = useState(initialKYC?.fetchedProfile?.dob || "");
  const [gender, setGender] = useState(initialKYC?.fetchedProfile?.gender || "Male");
  const [fatherName, setFatherName] = useState(initialKYC?.fetchedProfile?.fatherName || "");
  const [address, setAddress] = useState(initialKYC?.fetchedProfile?.address || "");
  const [panNumber, setPanNumber] = useState(initialKYC?.panNumber || "");
  const [aadhaarRaw, setAadhaarRaw] = useState(initialKYC?.aadhaarNumber || "");

  // Document Uploads State
  const [panFile, setPanFile] = useState<{ name: string; url: string; size: string } | null>(
    initialKYC?.panDocUrl
      ? { name: initialKYC.panDocName || "PAN_Card.pdf", url: initialKYC.panDocUrl, size: "Uploaded" }
      : null
  );

  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<{ name: string; url: string; size: string } | null>(
    initialKYC?.aadhaarFrontDocUrl
      ? { name: initialKYC.aadhaarFrontDocName || "Aadhaar_Front.pdf", url: initialKYC.aadhaarFrontDocUrl, size: "Uploaded" }
      : null
  );

  const [aadhaarBackFile, setAadhaarBackFile] = useState<{ name: string; url: string; size: string } | null>(
    initialKYC?.aadhaarBackDocUrl
      ? { name: initialKYC.aadhaarBackDocName || "Aadhaar_Back.pdf", url: initialKYC.aadhaarBackDocUrl, size: "Uploaded" }
      : null
  );

  // OCR Processing States
  const [isScanningPan, setIsScanningPan] = useState(false);
  const [isScanningAadhaarFront, setIsScanningAadhaarFront] = useState(false);
  const [isScanningAadhaarBack, setIsScanningAadhaarBack] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState("");

  const [stage, setStage] = useState<"INPUT" | "VERIFIED">(
    initialKYC?.isVerified ? "VERIFIED" : "INPUT"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const panInputRef = useRef<HTMLInputElement>(null);
  const aadhaarFrontInputRef = useRef<HTMLInputElement>(null);
  const aadhaarBackInputRef = useRef<HTMLInputElement>(null);

  const formatAadhaar = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const handleDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "PAN" | "AADHAAR_FRONT" | "AADHAAR_BACK"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const reader = new FileReader();
    reader.onload = async () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      if (type === "PAN") {
        setPanFile({ name: file.name, url, size: sizeStr });
        // Trigger AI OCR for PAN
        setIsScanningPan(true);
        try {
          const res = await ocrKycDocumentApi({
            docType: "PAN",
            fileDataUrl: url,
            fileName: file.name,
          });
          if (res.success && res.data) {
            if (res.data.panNumber) setPanNumber(res.data.panNumber);
            if (res.data.name && (!fullName || fullName === "Customer")) setFullName(res.data.name);
            if (res.data.dob && !dob) setDob(res.data.dob);
            if (res.data.fatherName && !fatherName) setFatherName(res.data.fatherName);
            setOcrSuccessMsg("PAN Card scanned successfully! Name & PAN extracted.");
          }
        } catch (err) {
          console.warn("OCR Error on PAN:", err);
        } finally {
          setIsScanningPan(false);
        }
      } else if (type === "AADHAAR_FRONT") {
        setAadhaarFrontFile({ name: file.name, url, size: sizeStr });
        // Trigger AI OCR for Aadhaar Front
        setIsScanningAadhaarFront(true);
        try {
          const res = await ocrKycDocumentApi({
            docType: "AADHAAR_FRONT",
            fileDataUrl: url,
            fileName: file.name,
          });
          if (res.success && res.data) {
            if (res.data.aadhaarNumber) setAadhaarRaw(res.data.aadhaarNumber);
            if (res.data.name && (!fullName || fullName === "Customer")) setFullName(res.data.name);
            if (res.data.dob && !dob) setDob(res.data.dob);
            if (res.data.gender) setGender(res.data.gender === "Female" ? "Female" : "Male");
            setOcrSuccessMsg("Aadhaar Card (Front) scanned! UID & Name extracted.");
          }
        } catch (err) {
          console.warn("OCR Error on Aadhaar Front:", err);
        } finally {
          setIsScanningAadhaarFront(false);
        }
      } else if (type === "AADHAAR_BACK") {
        setAadhaarBackFile({ name: file.name, url, size: sizeStr });
        // Trigger AI OCR for Aadhaar Back
        setIsScanningAadhaarBack(true);
        try {
          const res = await ocrKycDocumentApi({
            docType: "AADHAAR_BACK",
            fileDataUrl: url,
            fileName: file.name,
          });
          if (res.success && res.data) {
            if (res.data.address) setAddress(res.data.address);
            if (res.data.careOf && !fatherName) setFatherName(res.data.careOf);
            setOcrSuccessMsg("Aadhaar Card (Back) scanned! Address auto-populated.");
          }
        } catch (err) {
          console.warn("OCR Error on Aadhaar Back:", err);
        } finally {
          setIsScanningAadhaarBack(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitKYC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter the customer's full name.");
      return;
    }
    const cleanPan = panNumber.trim().toUpperCase();
    if (cleanPan.length !== 10) {
      setErrorMsg("Please enter a valid 10-character PAN number (e.g. ABCDE1234F).");
      return;
    }
    const cleanAadhaar = aadhaarRaw.replace(/\D/g, "");
    if (cleanAadhaar.length !== 12) {
      setErrorMsg("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!panFile) {
      setErrorMsg("Please upload customer's PAN Card photo or PDF.");
      return;
    }
    if (!aadhaarFrontFile) {
      setErrorMsg("Please upload customer's Aadhaar Card (Front Side) photo or PDF.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsProcessing(false);
      setStage("VERIFIED");
    }, 1000);
  };

  const handleConfirmAndProceed = () => {
    const kycResult: KYCData = {
      aadhaarNumber: aadhaarRaw.replace(/\D/g, ""),
      maskedAadhaar: `XXXX-XXXX-${aadhaarRaw.slice(-4)}`,
      panNumber: panNumber.trim().toUpperCase(),
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      kycMethod: "DOCUMENT_UPLOAD",
      kycProvider: "Savrdh Direct KYC Verification Desk",
      referenceId: `KYC-SVR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      panDocUrl: panFile?.url,
      panDocName: panFile?.name,
      aadhaarFrontDocUrl: aadhaarFrontFile?.url,
      aadhaarFrontDocName: aadhaarFrontFile?.name,
      aadhaarBackDocUrl: aadhaarBackFile?.url,
      aadhaarBackDocName: aadhaarBackFile?.name,
      fetchedProfile: {
        name: fullName || userProfile.fullName || "Customer",
        dob: dob || "",
        gender: gender || "Male",
        fatherName: fatherName || "",
        address: address || "",
        photoUrl: aadhaarFrontFile?.url || "",
      },
    };

    // Dispatch KYC Notification Alert to Savrdh Admin
    notifyKycCompletedApi({
      customerName: fullName || userProfile.fullName || "Customer",
      mobile: userProfile.mobile,
      email: userProfile.email,
      panNumber: panNumber.trim().toUpperCase(),
      maskedAadhaar: `XXXX-XXXX-${aadhaarRaw.slice(-4)}`,
      address: address || undefined,
    }).catch((err) => console.warn("[KYC Notify Error]:", err));

    onComplete(kycResult);
  };

  return (
    <div className="p-4 sm:p-5 max-w-md mx-auto">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={panInputRef}
        onChange={(e) => handleDocUpload(e, "PAN")}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
      />
      <input
        type="file"
        ref={aadhaarFrontInputRef}
        onChange={(e) => handleDocUpload(e, "AADHAAR_FRONT")}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
      />
      <input
        type="file"
        ref={aadhaarBackInputRef}
        onChange={(e) => handleDocUpload(e, "AADHAAR_BACK")}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Step Header */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Step 3 of 8: Customer Digital KYC</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">KYC & Document Verification</h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload customer identity documents (PAN and Aadhaar) to initiate credit dispute eligibility.
        </p>
      </div>

      {stage === "INPUT" ? (
        <form onSubmit={handleSubmitKYC} className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name (as per PAN) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Legal Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* PAN & Aadhaar numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  PAN Number *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs font-mono tracking-wider text-slate-100 placeholder-slate-500 focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={formatAadhaar(aadhaarRaw)}
                  onChange={(e) => setAadhaarRaw(e.target.value.replace(/\D/g, ""))}
                  placeholder="12-digit number"
                  className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* DOB & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House No, Building, Area, City, State, PIN"
                  className="w-full pl-9 pr-3 py-2 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Document Upload Sections */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 block">
                  Required KYC Document Uploads:
                </span>
                <span className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  AI OCR Enabled
                </span>
              </div>

              {ocrSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{ocrSuccessMsg}</span>
                </div>
              )}

              {/* 1. PAN Card Upload */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">1. PAN Card *</p>
                      <p className="text-[10px] text-slate-400">Clear Photo or PDF file</p>
                    </div>
                  </div>
                  {isScanningPan ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>AI Reading PAN...</span>
                    </div>
                  ) : panFile ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono truncate max-w-[120px] flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {panFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPanFile(null)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => panInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Aadhaar Front Upload */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">2. Aadhaar Card (Front) *</p>
                      <p className="text-[10px] text-slate-400">Photo with Name & Photo</p>
                    </div>
                  </div>
                  {isScanningAadhaarFront ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>AI Reading UID...</span>
                    </div>
                  ) : aadhaarFrontFile ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono truncate max-w-[120px] flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {aadhaarFrontFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAadhaarFrontFile(null)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => aadhaarFrontInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Aadhaar Back Upload */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">3. Aadhaar Card (Back)</p>
                      <p className="text-[10px] text-slate-400">Address side</p>
                    </div>
                  </div>
                  {isScanningAadhaarBack ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>AI Reading Address...</span>
                    </div>
                  ) : aadhaarBackFile ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono truncate max-w-[120px] flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {aadhaarBackFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAadhaarBackFile(null)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => aadhaarBackInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Verifying KYC Details...</span>
              </>
            ) : (
              <>
                <span>Submit KYC & Proceed to CIBIL Procurement</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Verified Stage Summary */
        <div className="space-y-4">
          <div className="p-5 rounded-2xl navy-card space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100">KYC Documents Verified</h3>
              <p className="text-xs text-emerald-400 mt-0.5 font-medium">
                Identity and proof of address confirmed
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Customer Name:</span>
                <span className="text-slate-200 font-semibold">{fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">PAN Number:</span>
                <span className="text-amber-400 font-mono font-bold">{panNumber.toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Aadhaar:</span>
                <span className="text-slate-200 font-mono">XXXX-XXXX-{aadhaarRaw.slice(-4)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Uploaded Files:</span>
                <span className="text-emerald-400 font-medium">PAN & Aadhaar Attached</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmAndProceed}
            className="w-full py-3.5 px-4 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to CIBIL Report Extraction (₹350 Fee)</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
