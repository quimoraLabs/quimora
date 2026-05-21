// import React from 'react';
import { motion } from 'framer-motion';


export default function Unauthorized401() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full text-center z-10">
        {/* Identity Scan Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-24 h-24 mx-auto mb-8 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center group"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          
          {/* Laser Scanner Line */}
          <motion.div 
            animate={{ top: ['10%', '85%', '10%'] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute left-4 right-4 h-0.5 bg-linear-to-r from-transparent via-indigo-500 to-transparent shadow-md shadow-indigo-500"
          />
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Error 401: Unauthorized
          </span>
          <h1 className="text-3xl font-extrabold mt-4 tracking-tight sm:text-4xl bg-clip-text text-transparent bg-linear-to-b from-white to-slate-400">
            Authentication Required
          </h1>
          <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
            We couldn't verify your identity. Please log in to your account to access this secure route.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/login'}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all text-sm tracking-wide"
          >
            Sign In to Continue
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
