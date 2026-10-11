// src/components/dashboard/OverviewTab.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, Icons, Pill, Skeleton } from "./ui";
import { getCompleteness } from "./profileFields";
import { formatMonthYear, isAdminRole } from "./format";

const StatCard = ({ icon, label, value, loading }) => {
  const Icon = Icons[icon];
  return (
    <Card className="p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f0ff] text-[#1a6bff]">
        <Icon />
      </span>
      {loading ? (
        <Skeleton className="mt-4 h-7 w-16" />
      ) : (
        <p className="mt-4 font-['Fraunces',Georgia,serif] text-[28px] font-bold leading-none text-[#1c1c1e]">
          {value}
        </p>
      )}
      <p className="mt-2 text-sm text-[#8c8c8c]">{label}</p>
    </Card>
  );
};

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 border-b border-[#f1eee8] py-3 text-sm last:border-0">
    <span className="text-[#8c8c8c]">{label}</span>
    <span className="min-w-0 truncate text-right font-medium text-[#1c1c1e]">{children}</span>
  </div>
);

export default function OverviewTab({ data, onNavigate }) {
  const { profile } = useAuth();
  const { listings, saved, loading } = data;

  const firstName = (profile?.name || "there").trim().split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { percent, missing } = getCompleteness(profile);

  const steps = [
    {
      id: "profile",
      done: percent === 100,
      title: "Complete your profile",
      text: missing.length
        ? `Add your ${missing.join(" and ").toLowerCase()} so people can trust and reach you.`
        : "Your profile is complete.",
      cta: "Update profile",
      onClick: () => onNavigate("profile"),
    },
    {
      id: "list",
      done: listings.length > 0,
      title: "List your first car",
      text: "Add photos and details — it only takes a few minutes.",
      cta: "List a car",
      to: "/list-car",
    },
    {
      id: "save",
      done: saved.length > 0,
      title: "Save a car you like",
      text: "Tap the heart on any listing to build your shortlist.",
      cta: "Browse cars",
      to: "/browse-cars",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1a6bff] via-[#1262f5] to-[#0b57ef] px-6 py-8 text-white shadow-[0_20px_44px_rgba(26,107,255,0.25)] sm:px-9 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-sm font-medium text-white/80">{greeting}</p>
        <h1 className="relative mt-1 font-['Fraunces',Georgia,serif] text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back, {firstName}
        </h1>
        <p className="relative mt-3 max-w-[480px] text-[15px] text-white/80">
          Manage your listings, saved cars and account details all in one place.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link
            to="/list-car"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1c1c1e] transition hover:bg-[#f1f5ff]"
          >
            <Icons.plus width={16} height={16} /> List a car
          </Link>
          <Link
            to="/browse-cars"
            className="inline-flex items-center rounded-xl border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse cars
          </Link>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="car" label="My listings" value={listings.length} loading={loading} />
        <StatCard icon="heart" label="Saved cars" value={saved.length} loading={loading} />
        <StatCard icon="user" label="Profile complete" value={`${percent}%`} />
        <StatCard icon="shield" label="Member since" value={formatMonthYear(profile?.createdAt)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* checklist */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">
              {doneCount === steps.length ? "You're all set 🎉" : "Getting started"}
            </h2>
            <span className="text-sm text-[#8c8c8c]">
              {doneCount} of {steps.length} done
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efece6]">
            <div
              className="h-full rounded-full bg-[#1a6bff] transition-all duration-700"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>

          <ul className="mt-5 space-y-3">
            {steps.map((s) => (
              <li
                key={s.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                  s.done ? "border-[#cfe8e3] bg-[#f4faf9]" : "border-[#efece6] bg-white"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    s.done ? "bg-[#0f9d8a] text-white" : "border-2 border-[#d9d5cc] text-transparent"
                  }`}
                >
                  <Icons.check width={14} height={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[15px] font-semibold ${s.done ? "text-[#0f766e]" : "text-[#1c1c1e]"}`}>
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-sm text-[#8c8c8c]">{s.text}</p>
                </div>
                {!s.done &&
                  (s.to ? (
                    <Link to={s.to} className="shrink-0 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
                      {s.cta}
                    </Link>
                  ) : (
                    <button type="button" onClick={s.onClick} className="shrink-0 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
                      {s.cta}
                    </button>
                  ))}
              </li>
            ))}
          </ul>
        </Card>

        {/* account snapshot */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">Account</h2>
            <button type="button" onClick={() => onNavigate("profile")} className="text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
              Edit
            </button>
          </div>
          <div className="mt-3">
            <Row label="Name">{profile?.name || "—"}</Row>
            <Row label="Email">{profile?.email || "—"}</Row>
            <Row label="Mobile">
              {profile?.mobile || (
                <button type="button" onClick={() => onNavigate("profile")} className="font-semibold text-[#1a6bff]">
                  Add number
                </button>
              )}
            </Row>
            <Row label="Account type">
              <Pill tone={isAdminRole(profile?.roles) ? "amber" : "blue"}>
                {isAdminRole(profile?.roles) ? "Admin" : "User"}
              </Pill>
            </Row>
          </div>
        </Card>
      </div>
    </div>
  );
}