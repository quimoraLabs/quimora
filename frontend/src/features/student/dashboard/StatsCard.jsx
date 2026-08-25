import StatCard from "../../../components/common/StatCard";

export default function StatsCard(props) {
  return <StatCard {...props} icon={props.Icon || props.icon} />;
}
