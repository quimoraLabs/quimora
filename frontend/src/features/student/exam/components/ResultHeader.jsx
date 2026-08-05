import { motion } from "framer-motion";

export const ResultHeader = ({ feedback }) => {
  const Icon = feedback.icon;

  return (
    <div
      className="p-10 text-center bg-elevated"
      style={{ borderBottom: "1px solid var(--color-border-soft)" }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-6"
      >
        <Icon
          className="w-20 h-20 text-accent"
          style={{ color: "var(--color-brand-mid)" }}
        />
      </motion.div>
      <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-main">
        {feedback.message}
      </h1>
      <p className="text-muted font-medium">
        Official Examination Results Portfolio
      </p>
    </div>
  );
};
