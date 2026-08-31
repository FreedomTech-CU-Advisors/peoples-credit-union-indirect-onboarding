import { viz } from "../brand";
import { Award, Target, TrendingUp, Users } from "lucide-react";
import { Avatar, Card, CardHeader, KpiCard, PageHeader, ProgressBar } from "../components/ui";
import { OFFICERS } from "../data/mock";
import { num, usd } from "../lib/format";
import { branchStats, officerStats } from "../lib/metrics";

export default function Team() {
  const avgAttainment =
    officerStats.reduce((s, o) => s + o.attainment, 0) / officerStats.length;
  const atGoal = officerStats.filter((o) => o.attainment >= 100).length;
  const top = officerStats[0];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Team Performance"
        subtitle="Debt protection production, goal attainment, and coaching opportunities by officer."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Active officers" value={num(OFFICERS.length)} icon={<Users size={20} />} hint={`${branchStats.length} branches`} />
        <KpiCard label="Avg goal attainment" value={`${avgAttainment.toFixed(0)}%`} accent="accent" icon={<Target size={20} />} hint={`${atGoal} at or above goal`} />
        <KpiCard label="Top performer" value={top.name.split(" ")[0]} icon={<Award size={20} />} hint={`${top.enrolled} enrollments`} />
        <KpiCard label="Team fee income" value={usd(officerStats.reduce((s, o) => s + o.premium, 0))} accent="slate" icon={<TrendingUp size={20} />} hint="Monthly recurring" />
      </div>

      {/* Top 3 podium */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {officerStats.slice(0, 3).map((o, i) => (
          <Card key={o.id} className="relative overflow-hidden p-5">
            <div className="absolute right-4 top-4 text-3xl font-black text-slate-100">
              #{i + 1}
            </div>
            <div className="flex items-center gap-3">
              <Avatar name={o.name} hue={o.avatarHue} />
              <div>
                <div className="font-bold text-slate-800">{o.name}</div>
                <div className="text-xs text-slate-400">{o.role} · {o.branchName}</div>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{o.enrolled}</div>
                <div className="text-[11px] text-slate-400">enrollments</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-ca-700">{usd(o.premium)}</div>
                <div className="text-[11px] text-slate-400">fee income / mo</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] font-semibold">
                <span className="text-slate-500">Goal attainment</span>
                <span className={o.attainment >= 100 ? "text-accent-700" : "text-slate-600"}>
                  {o.attainment.toFixed(0)}%
                </span>
              </div>
              <ProgressBar value={o.attainment} color={o.attainment >= 100 ? "#059669" : viz.primary} />
            </div>
          </Card>
        ))}
      </div>

      {/* Full leaderboard */}
      <Card className="mt-4">
        <CardHeader title="Officer leaderboard" subtitle="Ranked by debt protection enrollments this period" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Officer</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3 text-right">Presented</th>
                <th className="px-5 py-3 text-right">Enrolled</th>
                <th className="px-5 py-3 text-right">Fee income</th>
                <th className="w-56 px-5 py-3">Goal attainment</th>
              </tr>
            </thead>
            <tbody>
              {officerStats.map((o, i) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-5 py-3 text-sm font-bold text-slate-400">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={o.name} hue={o.avatarHue} />
                      <div>
                        <div className="font-semibold text-slate-800">{o.name}</div>
                        <div className="text-[11px] text-slate-400">{o.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{o.branchName}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{o.presented}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">{o.enrolled}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-700">{usd(o.premium)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar
                          value={Math.min(100, o.attainment)}
                          color={o.attainment >= 100 ? "#059669" : viz.primary}
                          height={7}
                        />
                      </div>
                      <span
                        className={`w-10 text-right text-xs font-bold ${
                          o.attainment >= 100 ? "text-accent-700" : "text-slate-600"
                        }`}
                      >
                        {o.attainment.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
