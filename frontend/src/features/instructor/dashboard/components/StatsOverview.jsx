import { motion } from "framer-motion";
import StatCard from "./StatCard";

const StatsOverview = ({ stats }) => {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, staggerChildren: 0.1 }}
    >
      {stats.map((stat, idx) => (
        <motion.div key={stat.title} whileHover={{ y: -4 }}>
          <StatCard idx={idx} stat={stat} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsOverview;
