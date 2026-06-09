import React from "react";
import { GraduationCap, Briefcase } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export default function Logo({ className = "", iconClassName = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Professional Academic Shield/Briefcase Outer Layer */}
      <div className="relative w-10 h-10 bg-gradient-to-tr from-[#1E293B] to-[#475569] rounded-xl flex items-center justify-center text-white shadow-[0_4px_12px_rgba(30,41,59,0.15)] border border-white/10 transition-transform duration-300 hover:scale-105">
        {/* Core Cap */}
        <GraduationCap className={`w-5.5 h-5.5 ${iconClassName}`} />
        
        {/* Professional Placement Badge */}
        <span className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border border-white max-w-[14px] max-h-[14px] flex items-center justify-center">
          <Briefcase className="w-2.5 h-2.5" />
        </span>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <h1 className="font-serif text-md md:text-lg font-bold tracking-tight text-white leading-none flex items-center gap-1.5">
            <span>PlacePro</span>
            <span className="text-emerald-300 font-sans font-semibold text-[10px] uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 py-0.5 px-2 rounded-full">AI</span>
          </h1>
          <span className="text-[9px] font-mono font-semibold tracking-wide text-slate-300 uppercase mt-1">
            Campus Placement Portal
          </span>
        </div>
      )}
    </div>
  );
}
export { Logo };
