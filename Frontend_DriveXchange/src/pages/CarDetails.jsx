// src/pages/CarDetails.jsx   (route: /cars/:id)
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import useCarDetails from "../hooks/useCarDetails";
import { useFavouriteActions } from "../context/FavouritesContext";
import Gallery from "../components/details/Gallery";
import ReserveCard from "../components/details/ReserveCard";
import SimilarCars from "../components/details/SimilarCars";
import { Description, KeySpecs, SafetyTips, SpecTable } from "../components/details/CarInfo";
import { EmptyState, ErrorBanner, Icons, Pill, Skeleton } from "../components/dashboard/ui";
import { formatPrice } from "../components/dashboard/format";

const STATUS = {
  AVAILABLE: { label: "Available", tone: "green" },
  RESERVED: { label: "Reserved", tone: "amber" },
  SOLD: { label: "Sold", tone: "gray" },
};

function DetailsSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Skeleton className="aspect-[16/10] w-full rounded-[24px]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-[74px]" />))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="hidden h-80 w-full lg:block" />
    </div>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { isFavourite, toggle: toggleFavourite } = useFavouriteActions();
  const { isLoggedIn, logout } = useAuth();
  const { car, loading, error, notFound, unauthorized, retry } = useCarDetails(id);
  const [shareNote, setShareNote] = useState("");

  // new car (e.g. from "similar cars") -> start at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // browser tab title
  useEffect(() => {
    if (!car) return;
    const previous = document.title;
    document.title = `${car.headline || car.name} | Drivexchange`;
    return () => { document.title = previous; };
  }, [car]);

  // decided by the server (from the JWT) — the page never needs the seller's email
  const isOwner = Boolean(car?.isOwner);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: car.headline || car.name, url });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return; // user closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied!");
    } catch {
      setShareNote("Copy the link from the address bar");
    }
    setTimeout(() => setShareNote(""), 2200);
  };

  const scrollToReserve = () =>
    document.getElementById("reserve-card")?.scrollIntoView({ behavior: "smooth", block: "center" });

  // the server rejected our token (expired / invalid) -> clear it
  useEffect(() => {
    if (unauthorized && isLoggedIn) logout();
  }, [unauthorized, isLoggedIn, logout]);

  // not allowed to see this page -> go to the login form, then come back here
  if (unauthorized) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, notice: "Please log in to view this car." }}
      />
    );
  }

  const status = car ? STATUS[car.status] ?? STATUS.AVAILABLE : null;
  const showMobileBar = car && car.status === "AVAILABLE" && !isOwner;

  return (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[#8c8c8c]">
          <Link to="/" className="transition hover:text-[#1a6bff]">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to="/browse-cars" className="transition hover:text-[#1a6bff]">Browse Cars</Link>
          {car && (
            <>
              <span aria-hidden="true">›</span>
              <span className="truncate font-medium text-[#1c1c1e]">{car.name}</span>
            </>
          )}
        </nav>

        {loading && <DetailsSkeleton />}

        {!loading && notFound && (
          <EmptyState
            icon="car"
            title="We couldn't find that car"
            text="It may have been removed by the seller, or the link might be wrong."
            action={
              <Link to="/browse-cars" className="inline-flex rounded-xl bg-[#1a6bff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6]">
                Browse all cars
              </Link>
            }
          />
        )}

        {!loading && error && <ErrorBanner message={error} onRetry={retry} />}

        {car && (
          <>
            {/* title row */}
            <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone={status.tone}>{status.label}</Pill>
                  <span className="text-sm text-[#8c8c8c]">{[car.year, car.name].filter(Boolean).join(" · ")}</span>
                </div>
                <h1 className="mt-3 max-w-[820px] font-['Fraunces',Georgia,serif] text-3xl font-bold leading-tight tracking-tight text-[#1c1c1e] sm:text-4xl">
                  {car.headline || car.name}
                </h1>
                {/* price (mobile only — desktop shows it in the card) */}
                <p className="mt-3 font-['Fraunces',Georgia,serif] text-3xl font-bold text-[#1a6bff] lg:hidden">
                  {formatPrice(car.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e6e2da] bg-white px-4 py-2.5 text-sm font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff] hover:text-[#1a6bff]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
                  <path d="M8.2 10.9l7.6-4.3M8.2 13.1l7.6 4.3" />
                </svg>
                {shareNote || "Share"}
              </button>

              {!isOwner && (
                <button
                  type="button"
                  onClick={() => toggleFavourite(car.id)}
                  aria-pressed={isFavourite(car.id)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    isFavourite(car.id)
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-[#e6e2da] bg-white text-[#1c1c1e] hover:border-[#1a6bff] hover:text-[#1a6bff]"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavourite(car.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20.5s-7.5-4.7-9.3-9.2C1.5 8.2 3.3 5 6.6 5c2 0 3.5 1.1 5.4 3.2C13.9 6.1 15.4 5 17.4 5c3.3 0 5.1 3.2 3.9 6.3-1.8 4.5-9.3 9.2-9.3 9.2z" />
                  </svg>
                  {isFavourite(car.id) ? "Saved" : "Save"}
                </button>
              )}
            </header>

            <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
              {/* ---------------- left ---------------- */}
              <div className="min-w-0 space-y-6">
                <Gallery images={car.images} alt={car.name} />
                <KeySpecs car={car} />
                <Description text={car.description} />
                <SpecTable car={car} />
                <SafetyTips />
              </div>

              {/* ---------------- right (sticky) ---------------- */}
              <aside className="lg:sticky lg:top-[124px]">
                <ReserveCard car={car} isOwner={isOwner} isLoggedIn={isLoggedIn} />
              </aside>
            </div>

            <SimilarCars car={car} />
          </>
        )}
      </main>

      <Footer />

      {/* mobile bottom bar */}
      {showMobileBar && (
        <>
          <div className="h-20 bg-[#161412] lg:hidden" aria-hidden="true" />
          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-[#efece6] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#a8a59e]">Asking price</p>
              <p className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1a6bff]">{formatPrice(car.price)}</p>
            </div>
            <button type="button" onClick={scrollToReserve} className="rounded-xl bg-[#1a6bff] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)]">
              Reserve this car
            </button>
          </div>
        </>
      )}
    </div>
  );
}
