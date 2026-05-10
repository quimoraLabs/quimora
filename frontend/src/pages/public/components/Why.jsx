import { motion } from "motion/react";
import { Zap, Target, BarChart3 } from "lucide-react";

const Why = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-indigo-600" />,
      title: "Skill Focused",
      description:
        "Quizzes designed to test real world skills, not just theory.",
      color: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      icon: <Target className="w-8 h-8 text-rose-500" />,
      title: "Instant Feedback",
      description:
        "Get immediate results and detailed explanations for every answer.",
      color: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-emerald-500" />,
      title: "Track Progress",
      description:
        "Login to save your results and track your improvement over time.",
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ];
  return (
    <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Why Quimora?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center gap-6"
            >
              <div
                className={`shrink-0 w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center`}
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Why;
