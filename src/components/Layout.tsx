import {
  Bell,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  PhoneCall,
  PieChart,
  Search,
  Smartphone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { activeBrand } from "../brand";
import { bookStats } from "../data/book";
import { claimStats } from "../lib/metrics";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const NAV: NavItem[] = [
  { to: "/project", label: "Project", icon: FolderKanban },
  { to: "/self-serve", label: "Self-serve", icon: Smartphone },
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/opportunities", label: "Opportunities", icon: Target },
  { to: "/outreach", label: "Outreach", icon: PhoneCall, badge: bookStats.hot },
  { to: "/production", label: "Production", icon: TrendingUp },
  { to: "/members", label: "Members & Loans", icon: ClipboardList },
  { to: "/demographics", label: "Coverage Demographics", icon: PieChart },
  { to: "/claims", label: "Claims", icon: LifeBuoy, badge: claimStats.open },
  { to: "/team", label: "Team", icon: Users },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={activeBrand.mark}
        alt={activeBrand.name}
        className="h-9 w-9 rounded-xl bg-white p-1 shadow-sm ring-1 ring-white/15"
      />
      <div className="leading-tight">
        <div className="font-slab text-[17px] font-bold tracking-tight text-white">
          {activeBrand.shortName}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-accent-300">
          {activeBrand.productName}
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const { search } = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gradient-to-b from-ink-800 to-ink-950 lg:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={{ pathname: item.to, search }}
            end={item.to === "/overview"}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-white/12 text-white shadow-inner ring-1 ring-white/10"
                  : "text-ink-100/80 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={isActive ? "text-accent-300" : "text-ink-200/70 group-hover:text-accent-300"}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-2 text-accent-300">
          <Target size={16} />
          <span className="text-xs font-bold uppercase tracking-wide">Q2 Goal</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-100/80">
          Credit union target: <span className="font-bold text-white">42%</span> debt
          protection penetration on eligible loans — {activeBrand.goalLead}{" "}
          <span className="font-semibold text-accent-300">{activeBrand.goalHighlight}</span>.
        </p>
      </div>
      <div className="border-t border-white/10 px-5 py-3 text-[11px] text-ink-200/60">
        {activeBrand.name} · Proof of concept · v0.1
      </div>
    </aside>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const current =
    NAV.find((n) => n.to === pathname)?.label ??
    (pathname === "/" ? "Project" : "Dashboard");
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:px-8">
      <div className="hidden text-sm font-medium text-slate-400 sm:block">
        Dashboard <span className="mx-1 text-slate-300">/</span>
        <span className="text-slate-700">{current}</span>
      </div>
      <div className="relative ml-auto hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search members, loans, claims…"
          className="h-9 w-72 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-ca-400 focus:bg-white focus:ring-2 focus:ring-ca-200"
        />
      </div>
      <button className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
        <Bell size={18} />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
      </button>
      <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-ca-600 to-ca-800 text-xs font-bold text-white">
          DM
        </div>
        <div className="hidden leading-tight sm:block">
          <div className="text-[13px] font-bold text-slate-800">Dana Morales</div>
          <div className="text-[11px] text-slate-500">VP, Lending</div>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
