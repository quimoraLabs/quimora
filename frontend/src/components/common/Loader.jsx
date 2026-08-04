// import React from "react";

export default function Loader({ text = "Loading data, please wait..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-100 w-full p-6 text-center animate-in fade-in duration-300">
      {/* Container with premium glow */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        {/* Outer Pulsing Ring */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 border border-blue-500/30 animate-ping opacity-75"></div>
        
        {/* Middle Rotating Dash Ring */}
        <div className="absolute inset-1.5 rounded-full border-4 border-transparent border-t-blue-500 border-b-blue-400 animate-spin duration-1000"></div>
        
        {/* Inner Tech-Glow Dot */}
        <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>
      </div>

      {/* Loading Text */}
      <h3 className="text-base font-semibold text-slate-200 tracking-wide">
        {text}
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">
        Fetching the latest records securely from our servers.
      </p>
    </div>
  );
}