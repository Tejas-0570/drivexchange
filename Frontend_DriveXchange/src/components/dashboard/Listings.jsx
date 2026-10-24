// src/components/dashboard/ListingsTab.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import CarTile from "./CarTile";
import { EmptyState, ErrorBanner, Icons, Modal, SectionHeader, Skeleton } from "./ui";
import { deleteCar } from "../../api/dashboardApi";
import { ApprovalBadge, ApprovalNote, isLive } from "./approval";


export const TileSkeletons = ({ count = 3 }) => (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-2xl border border-[#efece6] bg-white">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <div className="space-y-3 p-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    ))}
  </div>
);

/* "Are you sure?" dialog for removing a listing */
function DeleteDialog({ car, onClose, onDeleted, notify }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await deleteCar(car.id); // DELETE /api/v1/cars/{id}
      onDeleted(car.id);
      notify("Listing removed");
      onClose();
    } catch (err) {
      // 409 = the car got reserved in the meantime
      setError(err.message || "Could not remove this listing. Please try again.");
      setBusy(false);
    }
  };

  return (
    <Modal title="Remove this listing?" subtitle={car.name} onClose={busy ? () => {} : onClose}>
      <p className="text-sm leading-6 text-[#5f5f5f]">
        Buyers will no longer be able to find or open this car. Anyone who saved it will see it disappear
        from their list. This can't be undone — you'd have to list the car again.
      </p>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-xl border border-[#e6e2da] bg-white px-5 py-3 text-sm font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff] disabled:opacity-60"
        >
          Keep listing
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Removing…" : "Yes, remove it"}
        </button>
      </div>
    </Modal>
  );
}

export default function ListingsTab({ data, notify }) {
  const { listings, loading, errors, reload, removeListing } = data;
  const [toDelete, setToDelete] = useState(null);

  return (
    <div>
      <SectionHeader
        title="My Listings"
        subtitle="Cars you've listed for sale."
        action={
          <Link
            to="/list-car"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a6bff] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6]"
          >
            <Icons.plus width={16} height={16} /> List a car
          </Link>
        }
      />

      {errors.listings && (
        <div className="mb-6">
          <ErrorBanner message={errors.listings} onRetry={reload} />
        </div>
      )}

      {loading ? (
        <TileSkeletons />
      ) : listings.length === 0 && !errors.listings ? (
        <EmptyState
          icon="car"
          title="No listings yet"
          text="List your first car and reach thousands of verified buyers. It only takes a few minutes."
          action={
            <Link to="/list-car" className="inline-flex items-center gap-2 rounded-xl bg-[#1a6bff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6]">
              <Icons.plus width={16} height={16} /> List your first car
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((car) => (
            <div key={car.id}>
              <div className="mb-2">
                <ApprovalBadge status={car.approvalStatus} />
              </div>
              <CarTile car={car} showStatus onDelete={setToDelete} />
              <ApprovalNote status={car.approvalStatus} reason={car.rejectionReason} />
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <DeleteDialog
          car={toDelete}
          notify={notify}
          onClose={() => setToDelete(null)}
          onDeleted={removeListing}
        />
      )}
    </div>
  );
}
