import { motion } from "framer-motion";

export const ResultHeader = ({ feedback }) => {
  const Icon = feedback.icon;
  const isPassed = feedback.passed;

  return (
    <div
      className="p-10 text-center bg-elevated"
      style={{ borderBottom: "1px solid var(--color-border-soft)" }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-4"
      >
        <Icon
          className={`w-20 h-20 ${isPassed ? "text-green-500" : "text-red-500"}`}
        />
      </motion.div>

      {/* Passed / Failed Badge */}
      <div className="inline-block mb-3">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
            isPassed
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {isPassed ? "PASSED" : "FAILED"}
        </span>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-main">
        {feedback.message}
      </h1>
      <p className="text-muted font-medium">
        Official Examination Results Portfolio
      </p>
    </div>
  );
};