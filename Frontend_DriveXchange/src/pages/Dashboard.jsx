// src/pages/Dashboard.jsx
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import useDashboardData from "../hooks/useDashboardData";
import { Card, ErrorBanner, Icons, Pill, Skeleton, useToast } from "../components/dashboard/ui";
import { isAdminRole } from "../components/dashboard/format";
import OverviewTab from "../components/dashboard/Overview";
import ProfileTab from "../components/dashboard/Profile";
import ListingsTab from "../components/dashboard/Listings";
import SavedTab from "../components/dashboard/Saved";
import SecurityTab from "../components/dashboard/SecurityTab";

const TABS = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "profile", label: "My Profile", icon: "user" },
  { id: "listings", label: "My Listings", icon: "car" },
  { id: "saved", label: "Saved Cars", icon: "heart" },
  { id: "security", label: "Security", icon: "shield" },
];

export default function Dashboard() {
  const { profile, profileLoading, profileError, refreshProfile, logout } = useAuth();
  const data = useDashboardData();
  const { toastNode, notify } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // the active tab lives in the URL: /dashboard?tab=profile
  const requested = params.get("tab");
  const tab = TABS.some((t) => t.id === requested) ? requested : "overview";

  const go = (id) => {
    setParams(id === "overview" ? {} : { tab: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const counts = { listings: data.listings.length, saved: data.saved.length };
  const initial = (profile?.name || profile?.email || "U")[0].toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  /* profile hasn't arrived yet */
  const profileReady = Boolean(profile);

  return (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      {/* keyframes live here so no external .css file is needed */}
      <style>{`
        @keyframes dashFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes dashPop { from { opacity: 0; transform: translateY(8px) scale(.97); } to { opacity: 1; transform: none; } }
        .dash-fade { animation: dashFade .45s cubic-bezier(.22,.61,.36,1) both; }
        .dash-pop { animation: dashPop .25s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .dash-fade, .dash-pop { animation: none; } }
      `}</style>

      <Navbar />

      <main className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
        {/* mobile: horizontal tab bar */}
        <nav aria-label="Dashboard sections" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
          {TABS.map((t) => {
            const Icon = Icons[t.icon];
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => go(t.id)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "border-[#1a6bff] bg-[#1a6bff] text-white shadow-[0_6px_16px_rgba(26,107,255,0.25)]"
                    : "border-[#e6e2da] bg-white text-[#5f5f5f]"
                }`}
              >
                <Icon width={16} height={16} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
          {/* ---------------- sidebar (desktop) ---------------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-[124px] space-y-5">
              <Card className="p-5">
                {profileReady ? (
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1a6bff] to-[#0b57ef] text-lg font-semibold text-white">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-[#1c1c1e]">{profile.name || "Your account"}</p>
                      <p className="truncate text-xs text-[#8c8c8c]">{profile.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                )}
                {profileReady && (
                  <div className="mt-4">
                    <Pill tone={isAdminRole(profile.roles) ? "amber" : "blue"}>
                      {isAdminRole(profile.roles) ? "Admin" : "User"}
                    </Pill>
                  </div>
                )}
              </Card>

              <Card className="p-2">
                <nav aria-label="Dashboard sections" className="flex flex-col gap-1">
                  {TABS.map((t) => {
                    const Icon = Icons[t.icon];
                    const active = tab === t.id;
                    const count = counts[t.id];
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => go(t.id)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium transition ${
                          active
                            ? "bg-[#e8f0ff] text-[#1a6bff]"
                            : "text-[#5f5f5f] hover:bg-[#faf8f4] hover:text-[#1c1c1e]"
                        }`}
                      >
                        <Icon />
                        <span className="flex-1">{t.label}</span>
                        {count > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-white text-[#1a6bff]" : "bg-[#efece6] text-[#6b6b6b]"}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </Card>

              <Link
                to="/list-car"
                className="flex items-center justify-between rounded-2xl bg-[#161412] p-5 text-white transition hover:bg-[#2a2622]"
              >
                <div>
                  <p className="font-['Fraunces',Georgia,serif] text-lg font-bold">Selling a car?</p>
                  <p className="mt-1 text-xs text-white/60">List it in minutes</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1a6bff]">
                  <Icons.arrow />
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#8c8c8c] transition hover:bg-red-50 hover:text-red-600"
              >
                <Icons.logout /> Log out
              </button>
            </div>
          </aside>

          {/* ---------------- content ---------------- */}
          <section className="min-w-0">
            {!profileReady && profileError ? (
              <ErrorBanner message={profileError} onRetry={refreshProfile} />
            ) : !profileReady && profileLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-52 w-full rounded-[24px]" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <div key={tab} className="dash-fade">
                {tab === "overview" && <OverviewTab data={data} onNavigate={go} />}
                {tab === "profile" && <ProfileTab onNavigate={go} notify={notify} />}
                {tab === "listings" && <ListingsTab data={data} />}
                {tab === "saved" && <SavedTab data={data} />}
                {tab === "security" && <SecurityTab notify={notify} />}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      {toastNode}
    </div>
  );
}