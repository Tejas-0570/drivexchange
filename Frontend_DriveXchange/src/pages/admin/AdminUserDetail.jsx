// src/pages/admin/AdminUserDetail.jsx   (route: /admin/users/:id)
import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ErrorBanner, Icons, Skeleton, useToast } from "../../components/dashboard/ui";
import { formatDateTime, formatPaise, formatPrice, isAdminRole } from "../../components/dashboard/format";
import {
  AdminPill, ConfirmModal, FieldGrid, PageHeader, ReasonModal, Section,
  approvalPill, btn, makeActionRunner, orderStatusPill, userStatusPill,
} from "../../components/admin/adminUi";
import useAdminResource from "../../hooks/useAdminResource";
import { getUser, reactivateUser, suspendUser } from "../../api/adminApi";

export default function AdminUserDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { refreshOverview } = useOutletContext();
  const { toastNode, notify } = useToast();
  const { data: u, loading, error, status, reload } = useAdminResource(getUser, id);
  const [dialog, setDialog] = useState(null); // "suspend" | "reactivate"

  const run = makeActionRunner(notify, () => {
    reload();
    refreshOverview();
  });

  if (loading && !u) {
    return (
      <>
        <PageHeader title="User" back={{ to: "/admin/users", label: "All users" }} />
        <Skeleton className="h-80 w-full" />
      </>
    );
  }
  if (error || !u) {
    return (
      <>
        <PageHeader title="User" back={{ to: "/admin/users", label: "All users" }} />
        <ErrorBanner message={status === 404 ? "This user doesn't exist." : error} onRetry={status === 404 ? undefined : reload} />
      </>
    );
  }

  const suspended = String(u.status).toUpperCase() === "SUSPENDED";
  const admin = isAdminRole(u.roles ?? []);
  const isMe = Boolean(me?.email && u.email && me.email.toLowerCase() === u.email.toLowerCase());

  return (
    <>
      <PageHeader
        title={u.name || u.email}
        subtitle={u.email}
        back={{ to: "/admin/users", label: "All users" }}
        action={
          <div className="flex items-center gap-2">
            <AdminPill tone={admin ? "amber" : "blue"}>{admin ? "Admin" : "User"}</AdminPill>
            {userStatusPill(u.status)}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Section title="Profile">
            <FieldGrid
              items={[
                ["Name", u.name],
                ["Email", u.email],
                ["Mobile", u.mobile],
                ["Joined", formatDateTime(u.joinedAt)],
                ["Listings", u.listingsCount ?? 0],
                ["Orders", u.ordersCount ?? 0],
              ]}
            />
          </Section>

          <Section title="Recent listings">
            {(u.recentListings ?? []).length === 0 ? (
              <p className="text-sm text-[#8c8c8c]">No listings.</p>
            ) : (
              <ul className="divide-y divide-[#f1eee8]">
                {u.recentListings.map((l) => (
                  <li key={l.id}>
                    <Link to={`/admin/listings/${l.id}`} className="flex items-center justify-between gap-3 py-3 transition hover:text-[#1a6bff]">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{l.title}</span>
                        <span className="text-xs text-[#8c8c8c]">{formatPrice(l.price)}</span>
                      </span>
                      {approvalPill(l.approvalStatus)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Recent orders">
            {(u.recentOrders ?? []).length === 0 ? (
              <p className="text-sm text-[#8c8c8c]">No orders.</p>
            ) : (
              <ul className="divide-y divide-[#f1eee8]">
                {u.recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link to={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 transition hover:text-[#1a6bff]">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{o.carTitle}</span>
                        <span className="text-xs text-[#8c8c8c]">{formatPaise(o.amountPaise)} · {formatDateTime(o.createdAt)}</span>
                      </span>
                      {orderStatusPill(o.status)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div>
          <Section title="Account access">
            {suspended && (
              <div className="mb-4 rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#c53030]">
                <p className="font-semibold">Suspended{u.suspendedAt ? ` on ${formatDateTime(u.suspendedAt)}` : ""}</p>
                {u.suspensionReason && <p className="mt-1">{u.suspensionReason}</p>}
                <p className="mt-2 text-xs">They can't log in and their listings are hidden.</p>
              </div>
            )}

            {isMe ? (
              <p className="text-sm text-[#8c8c8c]">This is your own account. You can't suspend yourself.</p>
            ) : admin && !suspended ? (
              <p className="text-sm text-[#8c8c8c]">Administrator accounts can't be suspended from here.</p>
            ) : suspended ? (
              <button type="button" onClick={() => setDialog("reactivate")} className={`${btn.primary} w-full`}>
                <Icons.check width={16} height={16} /> Reactivate account
              </button>
            ) : (
              <>
                <button type="button" onClick={() => setDialog("suspend")} className={`${btn.ghostDanger} w-full`}>
                  Suspend account…
                </button>
                <p className="mt-3 text-xs leading-5 text-[#a8a59e]">A suspended user can't log in, and all their live listings disappear from search.</p>
              </>
            )}
          </Section>
        </div>
      </div>

      {dialog === "suspend" && (
        <ReasonModal
          title="Suspend this user"
          subtitle={u.email}
          placeholder="e.g. Repeated fake listings reported by buyers…"
          confirmLabel="Suspend user"
          onSubmit={(reason) => run(() => suspendUser(id, reason), "User suspended")}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "reactivate" && (
        <ConfirmModal
          title="Reactivate this user?"
          subtitle={u.email}
          text="They can log in again. Their listings are shown again once they are approved and available."
          confirmLabel="Reactivate"
          onConfirm={() => run(() => reactivateUser(id), "User reactivated")}
          onClose={() => setDialog(null)}
        />
      )}
      {toastNode}
    </>
  );
}
