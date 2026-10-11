// src/components/dashboard/ListingsTab.jsx
import { Link } from "react-router-dom";
import CarTile from "./CarTile";
import { EmptyState, ErrorBanner, Icons, SectionHeader, Skeleton } from "./ui";

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

export default function ListingsTab({ data }) {
  const { listings, loading, errors, reload } = data;

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
            <CarTile key={car.id} car={car} showStatus />
          ))}
        </div>
      )}
    </div>
  );
}