import { SummaryStat } from "@/types/opportunity";

type DashboardStatsProps = {
  stats: SummaryStat[];
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <section className="stats-grid" aria-label="Statistiques">
      {stats.map((stat) => (
        <article className="stat-card" key={stat.label}>
          <p className="stat-label">{stat.label}</p>
          <p className="stat-value">{stat.value}</p>
          <p className="stat-detail">{stat.detail}</p>
        </article>
      ))}
    </section>
  );
}
