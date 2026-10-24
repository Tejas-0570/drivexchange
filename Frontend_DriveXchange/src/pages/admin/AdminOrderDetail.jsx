// src/pages/admin/AdminOrderDetail.jsx   (route: /admin/orders/:id)
// One deal: who, how much, every payment attempt, and the three admin actions
// (confirm delivery, release the seller's payout, refund the buyer).
import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ErrorBanner, Icons, Skeleton, useToast } from "../../components/dashboard/ui";
import { formatDateTime, formatPaise } from "../../components/dashboard/format";
import {
  ConfirmModal, MoneyRow, PageHeader, ReasonModal, Section, Timeline,
  btn, makeActionRunner, orderStatusPill, paymentStatusPill,
} from "../../components/admin/adminUi";
import useAdminResource from "../../hooks/useAdminResource";
import { confirmDelivery, getTransaction, refundTransaction, releasePayout } from "../../api/adminApi";

const Party = ({ title, p }) => (
  <Section title={title}>
    <p className="font-semibold text-[#1c1c1e]">{p?.name || "—"}</p>
    <div className="mt-3 space-y-2 text-sm text-[#5f5f5f]">
      {p?.email && <p className="flex items-center gap-2 break-all"><Icons.mail width={15} height={15} className="shrink-0" /> {p.email}</p>}
      {p?.mobile && <p className="flex items-center gap-2"><Icons.phone width={15} height={15} className="shrink-0" /> {p.mobile}</p>}
    </div>
    {p?.id && (
      <Link to={`/admin/users/${p.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
        View user <Icons.arrow width={14} height={14} />
      </Link>
    )}
  </Section>
);

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { refreshOverview } = useOutletContext();
  const { toastNode, notify } = useToast();
  const { data: t, loading, error, status, reload } = useAdminResource(getTransaction, id);
  const [dialog, setDialog] = useState(null); // "deliver" | "payout" | "refund"

  const run = makeActionRunner(notify, () => {
    reload();
    refreshOverview();
  });

  if (loading && !t) {
    return (
      <>
        <PageHeader title="Order" back={{ to: "/admin/orders", label: "All orders" }} />
        <Skeleton className="h-96 w-full" />
      </>
    );
  }
  if (error || !t) {
    return (
      <>
        <PageHeader title="Order" back={{ to: "/admin/orders", label: "All orders" }} />
        <ErrorBanner message={status === 404 ? "This order doesn't exist." : error} onRetry={status === 404 ? undefined : reload} />
      </>
    );
  }

  const st = String(t.status).toUpperCase();
  const canDeliver = st === "PAID_HELD";
  const canPayout = st === "DELIVERED" || st === "DISPUTED";
  const canRefund = st === "PAID_HELD" || st === "DISPUTED";
  const sellerGets = Math.max(0, (t.amountPaise ?? 0) - (t.platformFeePaise ?? 0));

  const history = (t.history ?? []).map((h) => ({
    title: String(h.status).replace(/_/g, " "),
    text: h.by ? `by ${h.by}` : undefined,
    at: formatDateTime(h.at),
  }));

  return (
    <>
      <PageHeader
        title={t.carTitle}
        subtitle={`Order ${String(t.id).slice(0, 8).toUpperCase()} · created ${formatDateTime(t.createdAt)}`}
        back={{ to: "/admin/orders", label: "All orders" }}
        action={orderStatusPill(t.status)}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Section title="Money">
            <div className="divide-y divide-[#f1eee8]">
              <MoneyRow label="Car price" value={formatPaise(t.carPricePaise)} />
              <MoneyRow label="Booking amount (paid online)" value={formatPaise(t.amountPaise)} strong />
              <MoneyRow label="Drivexchange fee (kept from the booking)" value={formatPaise(t.platformFeePaise)} />
              <MoneyRow label="Seller payout" value={formatPaise(sellerGets)} strong />
              <MoneyRow label="Balance buyer pays the seller directly" value={formatPaise(t.balanceDuePaise)} />
            </div>
            <p className="mt-3 text-xs text-[#a8a59e]">Seller payout = booking amount − Drivexchange fee.</p>
          </Section>

          <Section title="Payment attempts">
            {(t.payments ?? []).length === 0 ? (
              <p className="text-sm text-[#8c8c8c]">No payment attempts yet.</p>
            ) : (
              <ul className="divide-y divide-[#f1eee8]">
                {t.payments.map((p) => (
                  <li key={p.razorpayPaymentId} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{formatPaise(p.amountPaise)} <span className="font-normal text-[#8c8c8c]">· {p.method || "online"}</span></p>
                      <p className="truncate font-mono text-xs text-[#a8a59e]">{p.razorpayPaymentId}</p>
                      <p className="text-xs text-[#8c8c8c]">{formatDateTime(p.createdAt)}{p.failureReason ? ` · ${p.failureReason}` : ""}</p>
                    </div>
                    {paymentStatusPill(p.status)}
                  </li>
                ))}
              </ul>
            )}
            {t.razorpayOrderId && <p className="mt-3 font-mono text-xs text-[#a8a59e]">Razorpay order: {t.razorpayOrderId}</p>}
          </Section>

          <Section title="History">
            <Timeline items={history} />
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Actions">
            {!canDeliver && !canPayout && !canRefund && (
              <p className="text-sm text-[#8c8c8c]">
                {st === "RELEASED" ? "This deal is complete." : st === "REFUNDED" ? "This order was refunded." : "Nothing to do for this order right now."}
              </p>
            )}

            <div className="space-y-3">
              {canDeliver && (
                <button type="button" onClick={() => setDialog("deliver")} className={`${btn.primary} w-full`}>
                  <Icons.check width={16} height={16} /> Confirm delivery
                </button>
              )}
              {canPayout && (
                <button type="button" onClick={() => setDialog("payout")} className={`${btn.primary} w-full`}>
                  Release payout to seller
                </button>
              )}
              {canRefund && (
                <button type="button" onClick={() => setDialog("refund")} className={`${btn.ghostDanger} w-full`}>
                  Refund the buyer…
                </button>
              )}
            </div>

            {t.deliveredAt && <p className="mt-4 text-xs text-[#5f5f5f]">Delivery confirmed {formatDateTime(t.deliveredAt)}.</p>}
            {t.payoutReleasedAt && (
              <p className="mt-2 text-xs text-[#5f5f5f]">
                Payout released {formatDateTime(t.payoutReleasedAt)}
                {t.payoutReference ? ` · ref ${t.payoutReference}` : ""}.
              </p>
            )}
          </Section>

          <Party title="Buyer" p={t.buyer} />
          <Party title="Seller" p={t.seller} />

          {t.carId && (
            <Link to={`/admin/listings/${t.carId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
              View the listing <Icons.arrow width={14} height={14} />
            </Link>
          )}
        </div>
      </div>

      {dialog === "deliver" && (
        <ConfirmModal
          title="Confirm delivery?"
          subtitle={t.carTitle}
          text="Confirm only after you have checked that the buyer received the car. The seller's payout can be released afterwards."
          confirmLabel="Confirm delivery"
          onConfirm={() => run(() => confirmDelivery(id), "Delivery confirmed")}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "payout" && (
        <ReasonModal
          title="Release payout"
          subtitle={`${formatPaise(sellerGets)} to ${t.seller?.name || "the seller"}`}
          label="Payout reference"
          placeholder="Bank transfer / UPI reference number"
          confirmLabel="Mark as paid"
          tone="primary"
          minLength={4}
          multiline={false}
          onSubmit={(ref) => run(() => releasePayout(id, ref), "Payout recorded")}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "refund" && (
        <ReasonModal
          title="Refund the buyer"
          subtitle={`${formatPaise(t.amountPaise)} goes back to the original payment method`}
          placeholder="e.g. Seller could not deliver the car…"
          confirmLabel="Refund"
          onSubmit={(reason) => run(() => refundTransaction(id, reason), "Refund started")}
          onClose={() => setDialog(null)}
        />
      )}
      {toastNode}
    </>
  );
}
