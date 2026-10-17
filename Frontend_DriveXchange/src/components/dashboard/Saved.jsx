// src/components/dashboard/SavedTab.jsx
import { Link } from "react-router-dom";
import CarTile from "./CarTile";
import { useFavourites } from "../../context/FavouritesContext";
import { TileSkeletons } from "./Listings";
import { EmptyState, ErrorBanner, SectionHeader } from "./ui";

export default function SavedTab({ data }) {
  const { saved, loading, errors, reload, removeSaved } = data;
  const { setFavourite } = useFavourites();

  // heart on a saved tile: hide it at once, tell the server, undo (reload) if that fails
  const handleRemove = async (id) => {
    removeSaved(id);
    const ok = await setFavourite(id, false);
    if (!ok) reload();
  };

  return (
    <div>
      <SectionHeader
        title="Saved Cars"
        subtitle="Your shortlist — cars you've marked with a heart."
      />

      {errors.saved && (
        <div className="mb-6">
          <ErrorBanner message={errors.saved} onRetry={reload} />
        </div>
      )}

      {loading ? (
        <TileSkeletons />
      ) : saved.length === 0 && !errors.saved ? (
        <EmptyState
          icon="heart"
          title="No saved cars yet"
          text="Tap the heart on any car you like and it will show up here, ready to compare later."
          action={
            <Link to="/browse-cars" className="inline-flex items-center rounded-xl bg-[#1a6bff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6]">
              Browse cars
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((car) => (
            <CarTile key={car.id} car={car} showStatus onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
