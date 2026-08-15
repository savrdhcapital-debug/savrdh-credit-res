import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showTagline = true,
  className = "",
}) => {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Gold Shield Emblem */}
      <div className="relative flex-shrink-0">
        <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-lg shadow-amber-500/20`}>
          <div className="w-full h-full rounded-[10px] bg-navy-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-amber-300/30"></div>
            <ShieldCheck className="w-2/3 h-2/3 text-amber-400 drop-shadow-[0_2px_8px_rgba(212,175,55,0.6)]" />
          </div>
        </div>
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-wider text-slate-100 font-heading ${titleSizes[size]}`}>
            SAVRDH
          </span>
          <span className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase">
            Resolution
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium text-slate-400 tracking-wider">
            Financial Services Private Limited
          </span>
        )}
      </div>
    </div>
  );
};
