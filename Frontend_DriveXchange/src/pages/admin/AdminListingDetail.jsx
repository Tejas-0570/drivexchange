// src/pages/admin/AdminListingDetail.jsx   (route: /admin/listings/:id)
// One listing in full + the decision buttons.
import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, ErrorBanner, Icons, Skeleton, useToast } from "../../components/dashboard/ui";
import { formatDateTime, formatMileage, formatPrice } from "../../components/dashboard/format";
import {
  ConfirmModal, FieldGrid, PageHeader, ReasonModal, Section, Timeline,
  approvalPill, availabilityPill, btn, makeActionRunner,
} from "../../components/admin/adminUi";
import useAdminResource from "../../hooks/useAdminResource";
import { approveListing, getListing, rejectListing, takedownListing } from "../../api/adminApi";

export default function AdminListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { refreshOverview } = useOutletContext();
  const { toastNode, notify } = useToast();
  const { data: car, loading, error, status, reload } = useAdminResource(getListing, id);

  const [dialog, setDialog] = useState(null); // "approve" | "reject" | "takedown" | null
  const [photo, setPhoto] = useState(0);

  const run = makeActionRunner(notify, () => {
    reload();
    refreshOverview();
  });

  if (loading && !car) {
    return (
      <>
        <PageHeader title="Listing" back={{ to: "/admin/listings", label: "All listings" }} />
        <Skeleton className="h-96 w-full" />
      </>
    );
  }
  if (error || !car) {
    return (
      <>
        <PageHeader title="Listing" back={{ to: "/admin/listings", label: "All listings" }} />
        <ErrorBanner message={status === 404 ? "This listing doesn't exist." : error} onRetry={status === 404 ? undefined : reload} />
      </>
    );
  }

  const approval = String(car.approvalStatus || "").toUpperCase();
  const photos = car.photos ?? [];
  const isMine = Boolean(user?.email && car.seller?.email && user.email.toLowerCase() === car.seller.email.toLowerCase());

  const history = (car.history ?? []).map((h) => ({
    title: `${h.action}${h.adminName ? ` · ${h.adminName}` : ""}`,
    text: h.reason,
    at: formatDateTime(h.at),
  }));

  return (
    <>
      <PageHeader
        title={car.title}
        subtitle={`Submitted ${formatDateTime(car.submittedAt)}`}
        back={{ to: "/admin/listings", label: "All listings" }}
        action={
          <div className="flex items-center gap-2">
            {approvalPill(car.approvalStatus)}
            {availabilityPill(car.status)}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* photos */}
          <Card className="overflow-hidden">
            <div className="grid aspect-[16/9] place-items-center bg-[#efece6] text-[#c9c5bb]">
              {photos[photo] ? <img src={photos[photo]} alt={car.title} className="h-full w-full object-cover" /> : <Icons.car width={48} height={48} />}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {photos.map((p, i) => (
                  <button key={p} type="button" onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === photo ? "border-[#1a6bff]" : "border-transparent"}`}>
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Section title="Car details">
            <FieldGrid
              items={[
                ["Price", formatPrice(car.price)],
                ["Brand / model", `${car.brand ?? ""} ${car.model ?? ""}`.trim() || "—"],
                ["Year", car.year],
                ["Mileage", car.mileage != null ? formatMileage(car.mileage) : "—"],
                ["Fuel", car.fuelType],
                ["Transmission", car.transmission],
                ["Colour", car.color],
                ["VIN", car.vin ? <span className="font-mono">{car.vin}</span> : "—"],
              ]}
            />
            {car.description && (
              <>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#a8a59e]">Description</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-[#1c1c1e]">{car.description}</p>
              </>
            )}
          </Section>

          <Section title="Review history">
            <Timeline items={history} />
          </Section>
        </div>

        <div className="space-y-6">
          {/* decision */}
          <Section title="Decision">
            {isMine && <p className="mb-4 rounded-xl bg-[#fdf1dc] px-4 py-3 text-sm text-[#b45309]">This is your own listing. Another admin must review it.</p>}

            {approval === "REJECTED" && car.rejectionReason && (
              <div className="mb-4 rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#c53030]">
                <p className="font-semibold">Rejected{car.reviewedBy ? ` by ${car.reviewedBy}` : ""}</p>
                <p className="mt-1">{car.rejectionReason}</p>
              </div>
            )}
            {approval === "APPROVED" && car.reviewedAt && (
              <p className="mb-4 text-sm text-[#5f5f5f]">Approved{car.reviewedBy ? ` by ${car.reviewedBy}` : ""} on {formatDateTime(car.reviewedAt)}.</p>
            )}

            {approval === "PENDING" && (
              <div className="space-y-3">
                <button type="button" disabled={isMine} onClick={() => setDialog("approve")} className={`${btn.primary} w-full`}>
                  <Icons.check width={16} height={16} /> Approve listing
                </button>
                <button type="button" disabled={isMine} onClick={() => setDialog("reject")} className={`${btn.ghostDanger} w-full`}>
                  Reject…
                </button>
              </div>
            )}
            {approval === "APPROVED" && (
              <button type="button" onClick={() => setDialog("takedown")} className={`${btn.ghostDanger} w-full`}>
                Take down this listing…
              </button>
            )}
            {approval === "REJECTED" && !car.rejectionReason && <p className="text-sm text-[#8c8c8c]">This listing was rejected.</p>}
          </Section>

          {/* seller */}
          <Section title="Seller">
            <p className="font-semibold text-[#1c1c1e]">{car.seller?.name || "—"}</p>
            <div className="mt-3 space-y-2 text-sm">
              {car.seller?.email && <p className="flex items-center gap-2 break-all text-[#5f5f5f]"><Icons.mail width={15} height={15} className="shrink-0" /> {car.seller.email}</p>}
              {car.seller?.mobile && <p className="flex items-center gap-2 text-[#5f5f5f]"><Icons.phone width={15} height={15} className="shrink-0" /> {car.seller.mobile}</p>}
              {car.seller?.joinedAt && <p className="text-xs text-[#a8a59e]">Member since {formatDateTime(car.seller.joinedAt)}</p>}
            </div>
            {car.seller?.id && (
              <Link to={`/admin/users/${car.seller.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
                View seller <Icons.arrow width={14} height={14} />
              </Link>
            )}
          </Section>
        </div>
      </div>

      {dialog === "approve" && (
        <ConfirmModal
          title="Approve this listing?"
          subtitle={car.title}
          text="Buyers will be able to find it in search straight away."
          confirmLabel="Approve"
          onConfirm={() => run(() => approveListing(id), "Listing approved")}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "reject" && (
        <ReasonModal
          title="Reject this listing"
          subtitle="The seller will see your reason and can fix and resubmit."
          placeholder="e.g. Photos are unclear, the VIN doesn't match the car…"
          confirmLabel="Reject listing"
          onSubmit={(reason) => run(() => rejectListing(id, reason), "Listing rejected")}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "takedown" && (
        <ReasonModal
          title="Take down this listing"
          subtitle="It disappears from search immediately."
          placeholder="e.g. Reported as a duplicate / misleading price…"
          confirmLabel="Take down"
          onSubmit={(reason) => run(() => takedownListing(id, reason), "Listing taken down")}
          onClose={() => setDialog(null)}
        />
      )}
      {toastNode}
    </>
  );
}
