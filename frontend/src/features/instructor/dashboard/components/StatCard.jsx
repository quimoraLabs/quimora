import { TrendingUp } from "lucide-react";

const StatCard = ({idx ,stat}) => {
    const Icon = stat.icon;
  return (
    <div
      key={idx}
      className="group relative overflow-hidden bg-surface border border-main rounded-2xl p-5 shadow-card transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-muted text-xs font-semibold uppercase tracking-wider">
          {stat.title}
        </span>
        <div
          className={`p-2.5 rounded-xl group-hover:bg-linear-to-tr ${stat.gradient}  text-main  shadow-md transform group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div
        className={`text-2xl sm:text-3xl font-extrabold text-main font-display transition-all duration-300 group-hover:bg-linear-to-tr ${stat.gradient} group-hover:bg-clip-text group-hover:text-transparent`}
      >
        {stat.value}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>{stat.change}</span>
      </div>
    </div>
  );
};

export default StatCard;
