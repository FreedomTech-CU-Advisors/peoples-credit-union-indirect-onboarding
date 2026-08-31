import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { viz } from "../brand";
import { initials } from "../lib/format";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5">
      <div>
        <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span
      className={`pill ${
        up ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"
      }`}
    >
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value).toFixed(1)}%{suffix}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  icon,
  hint,
  accent = "ca",
}: {
  label: string;
  value: string;
  delta?: number;
  icon: ReactNode;
  hint?: string;
  accent?: "ca" | "accent" | "slate";
}) {
  const accentMap = {
    ca: "bg-ca-600/10 text-ca-700",
    accent: "bg-accent-400/20 text-accent-700",
    slate: "bg-slate-200 text-slate-600",
  } as const;
  return (
    <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-cardhover">
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${accentMap[accent]}`}>
          {icon}
        </div>
        {typeof delta === "number" && <Delta value={delta} />}
      </div>
      <div className="mt-4 text-[26px] font-extrabold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="text-[13px] font-medium text-slate-500">{label}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </Card>
  );
}

export function Avatar({ name, hue }: { name: string; hue: number }) {
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-white"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 38%))` }}
    >
      {initials(name)}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = viz.primary,
  track = "#e1effb",
  height = 8,
}: {
  value: number;
  max?: number;
  color?: string;
  track?: string;
  height?: number;
}) {
  const pctv = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full rounded-full" style={{ background: track, height }}>
      <div
        className="rounded-full transition-all"
        style={{ width: `${pctv}%`, background: color, height }}
      />
    </div>
  );
}

const stageStyles: Record<string, string> = {
  Eligible: "bg-slate-100 text-slate-600",
  Presented: "bg-sky-100 text-sky-700",
  Quoted: "bg-amber-100 text-amber-700",
  Enrolled: "bg-emerald-100 text-emerald-800",
  Declined: "bg-rose-100 text-rose-600",
  // claim statuses
  Submitted: "bg-slate-100 text-slate-600",
  "In Review": "bg-sky-100 text-sky-700",
  "Pending Info": "bg-amber-100 text-amber-700",
  Approved: "bg-violet-100 text-violet-700",
  Paid: "bg-emerald-100 text-emerald-800",
  Denied: "bg-rose-100 text-rose-600",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`pill ${stageStyles[status] ?? "bg-slate-100 text-slate-600"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
