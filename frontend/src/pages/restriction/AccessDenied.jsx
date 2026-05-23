// import React from 'react';
import { motion } from 'framer-motion';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Danger Zone Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-rose-500/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full text-center z-10">
        {/* Pulsing Security Shield */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 mx-auto mb-8 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/5"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-mono text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Error 403: Forbidden
          </span>
          <h1 className="text-3xl font-extrabold mt-4 tracking-tight sm:text-4xl bg-clip-text text-transparent bg-linear-to-b from-white to-slate-400">
            Access Denied
          </h1>
          <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
            Your account does not have the required security permissions or roles to execute this action or view this route.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-8 flex flex-col gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/'}
            className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 py-3 rounded-xl font-medium transition-all text-sm tracking-wide text-slate-200 hover:text-white"
          >
            Return to Dashboard
          </motion.button>
          
          <button 
            onClick={() => window.history.back()}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors tracking-wide"
          >
            &larr; Go Back to Safety
          </button>
        </motion.div>
      </div>
    </div>
  );
}
