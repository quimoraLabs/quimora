
import { motion } from "motion/react";
import { Code2, Globe, Database, Server, Cpu } from "lucide-react";

const Topics = () => {
  const topicsList = [
  {
    title: "JavaScript",
    quizzes: "24 Quizzes",
    level: "Beginner",
    icon: <Globe className="w-10 h-10" />,
    color: "bg-yellow-400/10 text-yellow-600 dark:text-yellow-400",
    badgeColor: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
  },
  {
    title: "React",
    quizzes: "18 Quizzes",
    level: "Intermediate",
    icon: <Cpu className="w-10 h-10" />,
    color: "bg-blue-400/10 text-blue-600 dark:text-blue-400",
    badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
  },
  {
    title: "Node.js",
    quizzes: "20 Quizzes",
    level: "Intermediate",
    icon: <Server className="w-10 h-10" />,
    color: "bg-emerald-400/10 text-emerald-600 dark:text-emerald-400",
    badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400",
  },
  {
    title: "MongoDB",
    quizzes: "15 Quizzes",
    level: "Beginner",
    icon: <Database className="w-10 h-10" />,
    color: "bg-green-400/10 text-green-600 dark:text-green-400",
    badgeColor: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
  },
  {
    title: "HTML & CSS",
    quizzes: "30 Quizzes",
    level: "Beginner",
    icon: <Code2 className="w-10 h-10" />,
    color: "bg-orange-400/10 text-orange-600 dark:text-orange-400",
    badgeColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400",
  },
  {
    title: "Problem Solving",
    quizzes: "12 Quizzes",
    level: "Advanced",
    icon: <Cpu className="w-10 h-10" />,
    color: "bg-indigo-400/10 text-indigo-600 dark:text-indigo-400",
    badgeColor: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400",
  },
];
 return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Popular Topics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Choose a topic and start testing</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsList.map((topic, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-8 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl transition-all hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-indigo-500/5 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${topic.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                {topic.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">
                {topic.title}
              </h3>
              <p className="text-sm font-medium text-gray-500 mb-6">{topic.quizzes}</p>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${topic.badgeColor}`}>
                {topic.level}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Topics