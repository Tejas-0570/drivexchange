// src/pages/admin/AdminLayout.jsx
// The frame around every admin screen: dark sidebar (menu + counters), content on the right.
// It loads the overview numbers once, shows them as little badges on the menu, and hands
// `refreshOverview` to the pages (they call it after an action so the badges stay correct).
import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icons } from "../../components/dashboard/ui";
import { getOverview } from "../../api/adminApi";

const MENU = [
  { to: "/admin", label: "Overview", icon: "overview", end: true },
  { to: "/admin/listings", label: "Listings", icon: "car", badge: (o) => o?.pendingListings },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: "receipt",
    badge: (o) => (o ? (o.ordersAwaitingDelivery || 0) + (o.payoutsWaiting || 0) + (o.openDisputes || 0) : 0),
  },
  { to: "/admin/users", label: "Users", icon: "user" },
  { to: "/admin/activity", label: "Activity log", icon: "shield" },
];

export default function AdminLayout() {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setOverviewError("");
    getOverview(ctrl.signal)
      .then(setOverview)
      .catch((e) => {
        if (e?.name === "AbortError") return;
        if (e?.status === 401) return logout();
        setOverviewError(e?.message || "Could not load the numbers.");
      });
    return () => ctrl.abort();
  }, [tick, logout]);

  const refreshOverview = useCallback(() => setTick((t) => t + 1), []);

  const name = profile?.name || user?.email || "Admin";

  const link = (m, mobile = false) => {
    const Icon = Icons[m.icon] ?? Icons.shield;
    const n = m.badge?.(overview) || 0;
    return (
      <NavLink
        key={m.to}
        to={m.to}
        end={m.end}
        className={({ isActive }) =>
          mobile
            ? `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                isActive ? "border-[#1a6bff] bg-[#1a6bff] text-white" : "border-[#e6e2da] bg-white text-[#5f5f5f]"
              }`
            : `flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                isActive ? "bg-[#1a6bff] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
        }
      >
        <Icon width={mobile ? 16 : 18} height={mobile ? 16 : 18} />
        <span className={mobile ? "" : "flex-1"}>{m.label}</span>
        {n > 0 && (
          <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 text-xs font-bold text-[#161412]" aria-label={`${n} need attention`}>
            {n}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif] lg:grid lg:grid-cols-[260px_1fr]">
      {/* ---------------- sidebar (desktop) ---------------- */}
      <aside className="hidden bg-[#161412] lg:block">
        <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
          <Link to="/admin" className="flex items-center gap-3 px-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1a6bff]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 18L9 6l3 6 3-6 6 12" />
              </svg>
            </span>
            <span>
              <span className="block font-['Fraunces',Georgia,serif] text-lg font-bold leading-tight text-white">Drivexchange</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#f59e0b]">Admin Console</span>
            </span>
          </Link>

          <nav aria-label="Admin sections" className="mt-8 flex flex-col gap-1">
            {MENU.map((m) => link(m))}
          </nav>

          <div className="mt-auto space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
              <Icons.arrow width={16} height={16} className="rotate-180" /> Back to my account
            </Link>
            <div className="rounded-xl bg-white/5 p-3">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-white/50">Administrator</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-red-500/15 hover:text-red-300"
            >
              <Icons.logout width={16} height={16} /> Log out
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- top bar + tabs (mobile) ---------------- */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-[#161412] px-4 py-3">
          <span className="font-['Fraunces',Georgia,serif] text-base font-bold text-white">
            Drivexchange <span className="ml-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#f59e0b]">Admin</span>
          </span>
          <Link to="/dashboard" className="text-sm font-medium text-white/70">
            My account
          </Link>
        </div>
        <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto px-4 py-3">
          {MENU.map((m) => link(m, true))}
        </nav>
      </div>

      {/* ---------------- content ---------------- */}
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto max-w-[1100px]">
          {overviewError && (
            <p className="mb-4 rounded-xl bg-[#fdf1dc] px-4 py-2.5 text-xs text-[#b45309]">
              Couldn't load the counters ({overviewError}). The pages below still work.
            </p>
          )}
          <Outlet context={{ overview, overviewError, refreshOverview }} />
        </div>
      </main>
    </div>
  );
}
