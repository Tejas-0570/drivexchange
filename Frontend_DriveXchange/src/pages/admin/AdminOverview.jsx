// src/pages/admin/AdminOverview.jsx
// Landing screen of the Admin Console: the numbers, and "what needs me right now".
import { Link, useOutletContext } from "react-router-dom";
import { Card, ErrorBanner, Icons, Skeleton } from "../../components/dashboard/ui";
import { formatPaise } from "../../components/dashboard/format";
import { PageHeader, StatCard } from "../../components/admin/adminUi";

export default function AdminOverview() {
  const { overview: o, overviewError, refreshOverview } = useOutletContext();

  if (!o && overviewError) {
    return (
      <>
        <PageHeader title="Overview" />
        <ErrorBanner message={overviewError} onRetry={refreshOverview} />
      </>
    );
  }

  if (!o) {
    return (
      <>
        <PageHeader title="Overview" subtitle="Loading the latest numbers…" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </>
    );
  }

  // the "needs attention" list is built from the counters, nothing extra from the server
  const todo = [
    { n: o.pendingListings, text: "listing(s) waiting for review", to: "/admin/listings?approval=PENDING", cta: "Review" },
    { n: o.ordersAwaitingDelivery, text: "paid order(s) waiting for delivery confirmation", to: "/admin/orders?status=PAID_HELD", cta: "Open" },
    { n: o.payoutsWaiting, text: "delivered order(s) waiting for the seller payout", to: "/admin/orders?status=DELIVERED", cta: "Pay out" },
    { n: o.openDisputes, text: "open dispute(s)", to: "/admin/orders?status=DISPUTED", cta: "Resolve" },
  ].filter((t) => t.n > 0);

  return (
    <>
      <PageHeader title="Overview" subtitle="What's happening on Drivexchange right now." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending listings" value={o.pendingListings ?? 0} to="/admin/listings?approval=PENDING" tone={o.pendingListings > 0 ? "alert" : "default"} hint="Waiting for review" />
        <StatCard label="Awaiting delivery" value={o.ordersAwaitingDelivery ?? 0} to="/admin/orders?status=PAID_HELD" tone={o.ordersAwaitingDelivery > 0 ? "alert" : "default"} hint="Paid, car not yet delivered" />
        <StatCard label="Awaiting payout" value={o.payoutsWaiting ?? 0} to="/admin/orders?status=DELIVERED" tone={o.payoutsWaiting > 0 ? "alert" : "default"} hint="Delivered, seller not paid" />
        <StatCard label="Open disputes" value={o.openDisputes ?? 0} to="/admin/orders?status=DISPUTED" tone={o.openDisputes > 0 ? "alert" : "default"} hint="Need a decision" />
        <StatCard label="Money held" value={formatPaise(o.heldAmountPaise)} hint="Booking amounts not yet paid out" />
        <StatCard label="Live listings" value={o.activeListings ?? 0} to="/admin/listings?approval=APPROVED" hint="Approved and visible" />
        <StatCard label="Users" value={o.totalUsers ?? 0} to="/admin/users" />
        <StatCard label="Suspended users" value={o.suspendedUsers ?? 0} to="/admin/users?status=SUSPENDED" />
      </div>

      <h2 className="mb-3 mt-10 font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">Needs your attention</h2>
      {todo.length === 0 ? (
        <Card className="flex items-center gap-4 p-6">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e3f1ef] text-[#0f766e]">
            <Icons.check width={18} height={18} />
          </span>
          <div>
            <p className="font-semibold text-[#1c1c1e]">All caught up</p>
            <p className="text-sm text-[#8c8c8c]">Nothing is waiting for an admin right now.</p>
          </div>
        </Card>
      ) : (
        <Card className="divide-y divide-[#f1eee8]">
          {todo.map((t) => (
            <Link key={t.to} to={t.to} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#faf8f4]">
              <span className="grid h-10 min-w-10 place-items-center rounded-full bg-[#fdf1dc] px-2 text-sm font-bold text-[#b45309]">{t.n}</span>
              <span className="flex-1 text-sm text-[#1c1c1e]">{t.text}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a6bff]">
                {t.cta} <Icons.arrow width={14} height={14} />
              </span>
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
