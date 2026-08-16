import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Lock,
  Sparkles,
  MapPin,
  Calendar,
  User,
  ArrowRight,
  Upload,
  FileText,
  Image as ImageIcon,
  Check,
  Trash2,
  Eye,
  AlertCircle,
  Camera,
  Layers,
  FileCheck2
} from "lucide-react";
import { KYCData, UserProfile } from "../../types";

interface Step3Props {
  userProfile: UserProfile;
  onComplete: (kycData: KYCData) => void;
  initialKYC?: KYCData;
}

export const Step3DigitalKYC: React.FC<Step3Props> = ({ userProfile, onComplete, initialKYC }) => {
  // Method selection: "UPLOAD" (Direct Document Upload - No API) or "OTP" (UIDAI OTP)
  const [kycMethod, setKycMethod] = useState<"UPLOAD" | "OTP">(
    initialKYC?.kycMethod === "UIDAI_OTP" ? "OTP" : "UPLOAD"
  );

  // Form Fields
  const [fullName, setFullName] = useState(
    initialKYC?.fetchedProfile?.name || userProfile.fullName || "Rajeshwar Sharma"
  );
  const [dob, setDob] = useState(initialKYC?.fetchedProfile?.dob || "1988-06-14");
  const [gender, setGender] = useState(initialKYC?.fetchedProfile?.gender || "Male");
  const [fatherName, setFatherName] = useState(initialKYC?.fetchedProfile?.fatherName || "Devendra Sharma");
  const [address, setAddress] = useState(
    initialKYC?.fetchedProfile?.address ||
      "Flat 402, B-Wing, Royal Palms Residency, Aarey Milk Colony, Goregaon East, Mumbai, Maharashtra - 400065"
  );
  const [panNumber, setPanNumber] = useState(initialKYC?.panNumber || "ABCDE1234F");
  const [aadhaarRaw, setAadhaarRaw] = useState(initialKYC?.aadhaarNumber || "582948199283");

  // Document Uploads State (Files, DataURLs & Names)
  const [panFile, setPanFile] = useState<{ name: string; url: string; size: string } | null>(
    initialKYC?.panDocUrl
      ? { name: initialKYC.panDocName || "PAN_Card_Customer.jpg", url: initialKYC.panDocUrl, size: "1.4 MB" }
      : {
          name: "PAN_Card_Rajeshwar_Sharma.jpg",
          url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
          size: "1.2 MB",
        }
  );

  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<{ name: string; url: string; size: string } | null>(
    initialKYC?.aadhaarFrontDocUrl
      ? { name: initialKYC.aadhaarFrontDocName || "Aadhaar_Front.jpg", url: initialKYC.aadhaarFrontDocUrl, size: "1.8 MB" }
      : {
          name: "Aadhaar_Card_Front_Photo.jpg",
          url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
          size: "1.6 MB",
        }
  );

  const [aadhaarBackFile, setAadhaarBackFile] = useState<{ name: string; url: string; size: string } | null>(
    initialKYC?.aadhaarBackDocUrl
      ? { name: initialKYC.aadhaarBackDocName || "Aadhaar_Back.jpg", url: initialKYC.aadhaarBackDocUrl, size: "1.5 MB" }
      : {
          name: "Aadhaar_Card_Address_Back.jpg",
          url: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80",
          size: "1.3 MB",
        }
  );

  const [stage, setStage] = useState<"INPUT" | "OTP_SENT" | "VERIFIED">(
    initialKYC?.isVerified ? "VERIFIED" : "INPUT"
  );
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Refs for hidden file inputs
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

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhaarRaw(raw);
  };

  // Generic File Uploader with FileReader
  const handleDocUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "PAN" | "AADHAAR_FRONT" | "AADHAAR_BACK"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : "";
      if (type === "PAN") {
        setPanFile({ name: file.name, url, size: sizeStr });
      } else if (type === "AADHAAR_FRONT") {
        setAadhaarFrontFile({ name: file.name, url, size: sizeStr });
      } else if (type === "AADHAAR_BACK") {
        setAadhaarBackFile({ name: file.name, url, size: sizeStr });
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick auto-fill sample documents
  const handleAutoFillSampleDocs = () => {
    setFullName(userProfile.fullName || "Rajeshwar Sharma");
    setPanNumber("ABCDE1234F");
    setAadhaarRaw("582948199283");
    setDob("1988-06-14");
    setGender("Male");
    setFatherName("Devendra Sharma");
    setAddress("Flat 402, B-Wing, Royal Palms Residency, Aarey Milk Colony, Goregaon East, Mumbai, Maharashtra - 400065");
    setPanFile({
      name: "PAN_Card_Rajeshwar_Sharma.jpg",
      url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
      size: "1.2 MB",
    });
    setAadhaarFrontFile({
      name: "Aadhaar_Card_Front_Photo.jpg",
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
      size: "1.6 MB",
    });
    setAadhaarBackFile({
      name: "Aadhaar_Card_Address_Back.jpg",
      url: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80",
      size: "1.3 MB",
    });
  };

  // Submit via Direct Document Upload (No API Required)
  const handleSubmitDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panNumber || panNumber.trim().length !== 10) {
      setErrorMsg("Please enter a valid 10-character PAN Number (e.g. ABCDE1234F).");
      return;
    }
    if (!aadhaarRaw || aadhaarRaw.trim().length < 12) {
      setErrorMsg("Please enter a valid 12-digit Aadhaar Number.");
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
    }, 1200);
  };

  // Submit via UIDAI OTP
  const handleRequestAadhaarOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarRaw.length !== 12) {
      setErrorMsg("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    if (panNumber.length !== 10) {
      setErrorMsg("Please enter a valid 10-character PAN Number (e.g. ABCDE1234F).");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsProcessing(false);
      setStage("OTP_SENT");
    }, 1200);
  };

  const handleVerifyAadhaarOtp = () => {
    if (aadhaarOtp.length < 4) {
      setErrorMsg("Please enter the 6-digit Aadhaar OTP.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsProcessing(false);
      setStage("VERIFIED");
    }, 1200);
  };

  const handleConfirmAndProceed = () => {
    const kycResult: KYCData = {
      aadhaarNumber: aadhaarRaw,
      maskedAadhaar: `XXXX-XXXX-${aadhaarRaw.slice(-4)}`,
      panNumber: panNumber.toUpperCase(),
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      kycMethod: kycMethod === "UPLOAD" ? "DOCUMENT_UPLOAD" : "UIDAI_OTP",
      kycProvider:
        kycMethod === "UPLOAD"
          ? "Savrdh Document Verification Desk (Direct PAN & Aadhaar Upload)"
          : "UIDAI eKYC Gateway via NSDL Protean",
      referenceId: `KYC-SVR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      panDocUrl: panFile?.url,
      panDocName: panFile?.name,
      aadhaarFrontDocUrl: aadhaarFrontFile?.url,
      aadhaarFrontDocName: aadhaarFrontFile?.name,
      aadhaarBackDocUrl: aadhaarBackFile?.url,
      aadhaarBackDocName: aadhaarBackFile?.name,
      fetchedProfile: {
        name: fullName || userProfile.fullName || "Customer",
        dob: dob || "1988-06-14",
        gender: gender || "Male",
        fatherName: fatherName || "Devendra Sharma",
        address: address || "Goregaon East, Mumbai, Maharashtra 400065",
        photoUrl:
          aadhaarFrontFile?.url ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      },
    };
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
          <span>Step 3 of 8: Customer KYC Verification</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">KYC & Identity Verification</h2>
        <p className="text-xs text-slate-400 mt-1">
          PAN Card और Aadhaar Card अपलोड करके या UIDAI eKYC से बिना किसी पेड API के काम करें।
        </p>
      </div>

      {stage === "INPUT" && (
        <div className="space-y-4">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-navy-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setKycMethod("UPLOAD");
                setErrorMsg("");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                kycMethod === "UPLOAD"
                  ? "bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20 font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Documents</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setKycMethod("OTP");
                setErrorMsg("");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                kycMethod === "OTP"
                  ? "bg-amber-500 text-navy-950 shadow-md shadow-amber-500/20 font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aadhaar eKYC (OTP)</span>
            </button>
          </div>

          {/* ================= METHOD 1: DIRECT DOCUMENT UPLOAD (NO API REQUIRED) ================= */}
          {kycMethod === "UPLOAD" && (
            <form onSubmit={handleSubmitDocUpload} className="space-y-4">
              {/* Highlight Badge */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <FileCheck2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold text-[11px]">Direct Upload Mode (No 3rd-Party API Needed)</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillSampleDocs}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[10px] font-bold cursor-pointer"
                >
                  Auto-Fill Sample
                </button>
              </div>

              <div className="p-4 rounded-2xl navy-card space-y-4">
                {/* 1. PAN Card Document Upload Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. Customer PAN Card (Photo / PDF) *</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">Required</span>
                  </div>

                  {panFile ? (
                    <div className="p-2.5 rounded-xl bg-navy-950 border border-amber-500/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={panFile.url}
                          alt="PAN Preview"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-100 truncate">{panFile.name}</p>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            ✓ Uploaded ({panFile.size})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => panInputRef.current?.click()}
                          className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                          title="Change file"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setPanFile(null)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => panInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-navy-950/60 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Tap to Upload PAN Card</span>
                      <span className="text-[10px] text-slate-500">Camera Photo or PDF (Max 15MB)</span>
                    </button>
                  )}
                </div>

                {/* 2. Aadhaar Card Front Document Upload Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>2. Aadhaar Card (Front Side) *</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">Photo / PDF</span>
                  </div>

                  {aadhaarFrontFile ? (
                    <div className="p-2.5 rounded-xl bg-navy-950 border border-amber-500/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={aadhaarFrontFile.url}
                          alt="Aadhaar Front Preview"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-100 truncate">{aadhaarFrontFile.name}</p>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            ✓ Front Attached ({aadhaarFrontFile.size})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => aadhaarFrontInputRef.current?.click()}
                          className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setAadhaarFrontFile(null)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => aadhaarFrontInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-navy-950/60 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Upload Aadhaar (Front)</span>
                      <span className="text-[10px] text-slate-500">Includes Customer Photo & Name</span>
                    </button>
                  )}
                </div>

                {/* 3. Aadhaar Card Back Document Upload Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. Aadhaar Card (Back Side / Address)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Optional / Address</span>
                  </div>

                  {aadhaarBackFile ? (
                    <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-700 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={aadhaarBackFile.url}
                          alt="Aadhaar Back Preview"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-100 truncate">{aadhaarBackFile.name}</p>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            ✓ Back Attached ({aadhaarBackFile.size})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => aadhaarBackInputRef.current?.click()}
                          className="p-1.5 rounded-lg bg-navy-900 hover:bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setAadhaarBackFile(null)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => aadhaarBackInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-800 hover:border-amber-500/40 bg-navy-950/40 text-center cursor-pointer transition-all flex items-center justify-center gap-2 text-slate-300"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-medium">Attach Aadhaar Back (Address side)</span>
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-2">
                    Confirm Extracted Customer Information
                  </span>

                  <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Customer Full Name (as per PAN/Aadhaar) *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rajeshwar Sharma"
                        className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        required
                      />
                    </div>

                    {/* PAN & Aadhaar Number Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          10-Digit PAN Number *
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                          className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs font-mono uppercase text-slate-100 placeholder-slate-600 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          12-Digit Aadhaar *
                        </label>
                        <input
                          type="text"
                          value={formatAadhaar(aadhaarRaw)}
                          onChange={handleAadhaarChange}
                          placeholder="5829 4819 9283"
                          className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* DOB & Gender */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
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
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Residential Address
                      </label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full Residential Address as on Aadhaar..."
                        className="w-full px-3 py-2 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy & UIDAI Masking Guarantee */}
                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>UIDAI Masking & 256-Bit SSL Data Security</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Uploaded PAN & Aadhaar documents are stored in Savrdh's encrypted customer locker. Aadhaar numbers are automatically masked as <span className="font-mono text-amber-300">XXXX-XXXX-9283</span> in accordance with RBI & UIDAI security directives.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                id="btn-submit-doc-kyc"
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                    <span>Verifying Documents & Masking Aadhaar...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Documents & Confirm Identity</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= METHOD 2: UIDAI OTP METHOD ================= */}
          {kycMethod === "OTP" && (
            <form onSubmit={handleRequestAadhaarOtp} className="space-y-4">
              <div className="p-4 rounded-2xl navy-card space-y-4">
                {/* Aadhaar Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      12-Digit Aadhaar Number *
                    </label>
                    <span className="text-[10px] text-slate-400">UIDAI Encrypted</span>
                  </div>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-aadhaar"
                      type="text"
                      value={formatAadhaar(aadhaarRaw)}
                      onChange={handleAadhaarChange}
                      placeholder="5829 4819 9283"
                      className="w-full pl-10 pr-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-sm font-mono tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* PAN Card Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Permanent Account Number (PAN) *
                    </label>
                    <span className="text-[10px] text-slate-400">Income Tax Dept</span>
                  </div>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-pan"
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full pl-10 pr-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-sm font-mono tracking-wider text-slate-100 placeholder-slate-600 focus:outline-none uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>UIDAI Consent & Data Privacy</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    By clicking proceed, you authorize Savrdh Financial Services Pvt. Ltd. to query UIDAI to retrieve your verified KYC profile for credit resolution purposes.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                id="btn-request-aadhaar-otp"
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                    <span>Connecting to UIDAI Provider...</span>
                  </>
                ) : (
                  <>
                    <span>Send Aadhaar OTP</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Stage: OTP Sent (UIDAI OTP Method) */}
      {stage === "OTP_SENT" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl navy-card space-y-4">
            <div className="text-center pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Aadhaar eKYC Authentication
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                OTP sent to Aadhaar-linked mobile: <strong className="text-amber-400">******{userProfile.mobile.slice(-4) || "1823"}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter 6-Digit UIDAI OTP
              </label>
              <input
                id="input-aadhaar-otp"
                type="text"
                maxLength={6}
                value={aadhaarOtp}
                onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit Aadhaar OTP"
                className="w-full px-4 py-3 bg-navy-950/80 border border-slate-700/70 focus:border-amber-500 rounded-xl text-center text-lg tracking-widest font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setAadhaarOtp("849201")}
              className="w-full py-2 px-3 rounded-lg bg-navy-800 border border-slate-700 hover:border-amber-500/40 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Fill Aadhaar OTP (849201)</span>
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}

          <button
            id="btn-verify-aadhaar-otp"
            type="button"
            disabled={isProcessing}
            onClick={handleVerifyAadhaarOtp}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Fetching UIDAI Verified Profile...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Verify Aadhaar & Fetch KYC Profile</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Stage: VERIFIED (Both Methods) */}
      {stage === "VERIFIED" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl navy-card-gold space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">
                    {kycMethod === "UPLOAD" ? "Documents Verified by Savrdh Desk" : "UIDAI eKYC Verified"}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-medium">Customer Identity Confirmed</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-900 border border-slate-700 text-amber-400 font-bold">
                {kycMethod === "UPLOAD" ? "DOC-VAULT-OK" : "UIDAI-OK"}
              </span>
            </div>

            {/* Fetched/Uploaded Profile Card */}
            <div className="flex items-start gap-3.5 p-3 rounded-xl bg-navy-950/80 border border-slate-800">
              <img
                src={
                  panFile?.url ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                }
                alt="Customer Photo"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-amber-500/40 flex-shrink-0 bg-slate-900"
              />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                  <span>{fullName || userProfile.fullName || "Rajeshwar Sharma"}</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    PAN Match
                  </span>
                </div>
                <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>DOB: {dob} ({gender})</span>
                </div>
                <div className="text-slate-400 flex items-start gap-1 text-[11px] leading-tight">
                  <MapPin className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{address}</span>
                </div>
              </div>
            </div>

            {/* Verified Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-navy-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Aadhaar (Masked)</span>
                <span className="font-mono text-slate-200 font-medium">
                  XXXX-XXXX-{aadhaarRaw.slice(-4)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">PAN Status</span>
                <span className="font-mono text-emerald-400 font-medium">{panNumber} (Active)</span>
              </div>
            </div>

            {/* Uploaded Documents Badges */}
            {kycMethod === "UPLOAD" && (
              <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Archived KYC Documents
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {panFile && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3" /> PAN: {panFile.name}
                    </span>
                  )}
                  {aadhaarFrontFile && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3" /> Aadhaar Front: {aadhaarFrontFile.name}
                    </span>
                  )}
                  {aadhaarBackFile && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3" /> Aadhaar Back: {aadhaarBackFile.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            id="btn-proceed-credit-report"
            type="button"
            onClick={handleConfirmAndProceed}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-navy-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Fetch Credit Report</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
