// import React from "react";
import { Trash2, AlertTriangle, UserMinus, FileX } from "lucide-react";

/**
 * Shared Delete/Block Modal
 * @param {string} type - 'account', 'user', 'quiz', 'general'
 * @param {string} title - Optional custom title
 * @param {string} message - Optional custom message
 * @param {function} onClose - Function to close modal
 * @param {function} onConfirm - Function to execute delete logic
 */
const DeleteConfirmModal = ({ 
  onClose, 
  onConfirm, 
  type = "general", 
  title, 
  message 
}) => {

  // Configuration based on the "Sense" of what is being deleted
  const config = {
    account: {
      icon: <Trash2 size={36} />,
      title: title || "Critical System Warning",
      message: message || "Executing a Core Purge will disconnect your profile from the Quimora Mesh. This action requires L3 clearance.",
      confirmText: "Confirm Execution",
      color: "red"
    },
    user: {
      icon: <UserMinus size={36} />,
      title: title || "Restrict Access",
      message: message || "Are you sure you want to block this identity? They will lose all uplink privileges to your data.",
      confirmText: "Execute Block",
      color: "orange"
    },
    quiz: {
      icon: <FileX size={36} />,
      title: title || "Purge Data Set",
      message: message || "This quiz data will be wiped from the local grid. This operation is irreversible.",
      confirmText: "Confirm Delete",
      color: "red"
    },
    general: {
      icon: <AlertTriangle size={36} />,
      title: title || "Confirm Operation",
      message: message || "Are you sure you want to proceed with this protocol?",
      confirmText: "Confirm",
      color: "red"
    }
  };

  const current = config[type] || config.general;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/60 dark:bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg p-10 md:p-12 bg-white dark:bg-[#0d0d0d] rounded-[3rem] md:rounded-[4rem] border border-slate-200 dark:border-white/10 text-center shadow-3xl">
        
        {/* Dynamic Icon Container */}
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 md:mb-10 border transition-all shadow-2xl
          ${current.color === 'red' 
            ? 'bg-red-600/10 text-red-600 border-red-600/20 shadow-red-600/10' 
            : 'bg-orange-600/10 text-orange-600 border-orange-600/20 shadow-orange-600/10'}`}>
          {current.icon}
        </div>

        {/* Dynamic Text */}
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-6 italic text-slate-900 dark:text-white leading-tight">
          {current.title}
        </h2>
        
        <p className="text-slate-500 dark:text-white/40 text-sm mb-10 md:mb-12 leading-relaxed font-bold tracking-wide max-w-sm mx-auto">
          {current.message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className="py-4 md:py-5 bg-red-600 text-white rounded-4xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-600/20"
          >
            {current.confirmText}
          </button>
          
          <button 
            onClick={onClose} 
            className="py-4 md:py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-4xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all"
          >
            Abort Protocol
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;