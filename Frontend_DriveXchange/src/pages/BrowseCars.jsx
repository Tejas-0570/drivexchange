// src/pages/BrowseCars.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CarCard from "../components/CarCard";
import FiltersPanel from "../components/browse/FiltersPanel";
import CardSkeleton from "../components/browse/CardSkeleton";
import { EmptyState, ErrorBanner, Icons } from "../components/dashboard/ui";
import useCarSearch from "../hooks/useCarSearch";
import { useFavouriteActions } from "../context/FavouritesContext";
import { useDebouncedField } from "../hooks/useDebouncedField";
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  describeFilters,
  filtersFromParams,
  PAGE_SIZE,
  paramsFromFilters,
  SORTS,
} from "../components/browse/browseConfig";

/* invisible marker at the bottom of the grid: when it comes near the screen, load more */
function InfiniteSentinel({ onVisible, disabled }) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && onVisible(),
      { rootMargin: "600px 0px" } // start loading ~600px before the user reaches the end
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onVisible, disabled]);

  return <div ref={ref} aria-hidden="true" className="h-px" />;
}

const BrowseCars = () => {
  const navigate = useNavigate();
  const { isFavourite, toggle: toggleFavourite } = useFavouriteActions();
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // the URL is the single source of truth for filters
  const filters = useMemo(() => filtersFromParams(params), [params]);

  const update = useCallback(
    (patch) =>
      setParams(
        (prev) => paramsFromFilters({ ...filtersFromParams(prev), ...patch }),
        { replace: true }
      ),
    [setParams]
  );

  const clearAll = () => update({ ...DEFAULT_FILTERS, sort: filters.sort });

  const { items, total, hasMore, loading, loadingMore, error, loadMore, retry } =
    useCarSearch(filters, PAGE_SIZE);

  // search box: instant typing, request after a pause
  const [search, setSearch] = useDebouncedField(filters.q, (v) => update({ q: v.trim() }), 350);

  const activeCount = activeFilterCount(filters);
  const chips = describeFilters(filters);

  // lock page scroll while the mobile filter drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const countText = loading
    ? "Searching…"
    : `${total.toLocaleString()} ${total === 1 ? "car" : "cars"} found`;

  return (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      <style>{`
        @keyframes bcIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes bcSheet { from { transform: translateY(100%); } to { transform: none; } }
        .bc-in { animation: bcIn .5s cubic-bezier(.22,.61,.36,1) both; }
        .bc-sheet { animation: bcSheet .3s cubic-bezier(.22,.61,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .bc-in, .bc-sheet { animation: none; } }
      `}</style>

      <Navbar />

      <main className="mx-auto max-w-[1320px] px-4 py-10 md:px-8">
        {/* ---------------- heading ---------------- */}
        <div>
          <h1 className="font-['Fraunces',Georgia,serif] text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Browse Cars
          </h1>
          <p className="mt-2 text-[15px] text-[#8c8c8c]" aria-live="polite">{countText}</p>
        </div>

        {/* ---------------- toolbar ---------------- */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-[#e6e2da] bg-white px-4 transition focus-within:border-[#1a6bff] focus-within:shadow-[0_0_0_4px_rgba(26,107,255,0.12)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand, model or keyword…"
              aria-label="Search cars"
              className="w-full bg-transparent py-3.5 text-[15px] outline-none placeholder:text-[#b3b0a9]"
            />
          </label>

          <div className="relative">
            <select
              aria-label="Sort cars"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value })}
              className="appearance-none rounded-xl border border-[#e6e2da] bg-white py-3.5 pl-4 pr-10 text-[15px] font-medium text-[#1c1c1e] outline-none transition focus:border-[#1a6bff] focus:shadow-[0_0_0_4px_rgba(26,107,255,0.12)]"
            >
              {SORTS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
            <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e6e2da] bg-white px-4 py-3.5 text-[15px] font-medium text-[#1c1c1e] transition hover:border-[#1a6bff] lg:hidden"
          >
            Filters
            {activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#1a6bff] px-1.5 text-xs font-semibold text-white">{activeCount}</span>
            )}
          </button>
        </div>

        {/* active filter chips */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => update(c.patch)}
                aria-label={`Remove filter ${c.label}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0ff] py-1.5 pl-3.5 pr-2.5 text-[13px] font-medium text-[#1a6bff] transition hover:bg-[#d8e6ff]"
              >
                {c.label}
                <Icons.close width={13} height={13} />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="ml-1 text-[13px] font-semibold text-[#8c8c8c] underline hover:text-[#1a6bff]">
              Clear all
            </button>
          </div>
        )}

        {/* ---------------- sidebar + results ---------------- */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[124px]">
              <FiltersPanel filters={filters} onChange={update} onClear={clearAll} activeCount={activeCount} />
            </div>
          </aside>

          <section aria-label="Search results" className="min-w-0">
            {/* first load / filter change */}
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (<CardSkeleton key={i} />))}
              </div>
            )}

            {/* error with nothing to show */}
            {!loading && error && items.length === 0 && (
              <ErrorBanner message={error} onRetry={retry} />
            )}

            {/* nothing matches */}
            {!loading && !error && items.length === 0 && (
              <EmptyState
                icon="car"
                title="No cars match your search"
                text="Try removing a filter or searching for something broader."
                action={
                  <button type="button" onClick={clearAll} className="rounded-xl bg-[#1a6bff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6]">
                    Clear all filters
                  </button>
                }
              />
            )}

            {/* results */}
            {items.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((car, i) => (
                    <div key={car.id} className="bc-in h-full" style={{ animationDelay: `${(i % PAGE_SIZE) * 45}ms` }}>
                      <CarCard
                        image={car.image}
                        name={car.name}
                        price={car.price}
                        year={car.year}
                        location={car.location}
                        mileage={car.mileage ?? 0}
                        fuelType={car.fuelType}
                        transmission={car.transmission}
                        verified={car.verified}
                        isFavourite={isFavourite(car.id)}
                        onFavouriteChange={(next) => toggleFavourite(car.id, next)}
                        onClick={() => navigate(`/cars/${car.id}`)}
                      />
                    </div>
                  ))}

                  {/* skeletons while the next page loads */}
                  {loadingMore && Array.from({ length: 3 }).map((_, i) => (<CardSkeleton key={`s${i}`} />))}
                </div>

                {/* error while loading more */}
                {error && (
                  <div className="mt-6">
                    <ErrorBanner message={error} onRetry={retry} />
                  </div>
                )}

                {/* the invisible trigger */}
                <InfiniteSentinel onVisible={loadMore} disabled={!hasMore || Boolean(error)} />

                {/* keyboard / fallback button */}
                {hasMore && !loadingMore && !error && (
                  <div className="mt-8 text-center">
                    <button type="button" onClick={loadMore} className="rounded-xl border border-[#e6e2da] bg-white px-6 py-3 text-sm font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff]">
                      Load more cars
                    </button>
                  </div>
                )}

                {!hasMore && !loadingMore && (
                  <p className="mt-10 text-center text-sm text-[#a8a59e]">
                    You've seen all {total.toLocaleString()} {total === 1 ? "car" : "cars"} 🎉
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* ---------------- mobile filter drawer ---------------- */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-[#161412]/50 backdrop-blur-sm lg:hidden"
          onMouseDown={(e) => e.target === e.currentTarget && setDrawerOpen(false)}
        >
          <div role="dialog" aria-modal="true" aria-label="Filters" className="bc-sheet max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-[#faf8f4] p-4 pb-6">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#d9d5cc]" />
            <FiltersPanel filters={filters} onChange={update} onClear={clearAll} activeCount={activeCount} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="mt-4 w-full rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)]"
            >
              {loading ? "Show results" : `Show ${total.toLocaleString()} ${total === 1 ? "car" : "cars"}`}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BrowseCars;