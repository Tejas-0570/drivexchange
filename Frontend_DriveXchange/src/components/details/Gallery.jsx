// src/components/details/Gallery.jsx
import { useCallback, useEffect, useState } from "react";
import { Icons } from "../dashboard/ui";

const Arrow = ({ dir, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={dir < 0 ? "Previous photo" : "Next photo"}
    className={`grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1c1c1e] shadow-[0_6px_16px_rgba(0,0,0,0.2)] backdrop-blur transition hover:scale-105 hover:bg-white ${className}`}
  >
    <Icons.arrow className={dir < 0 ? "rotate-180" : ""} />
  </button>
);

function Lightbox({ photos, index, alt, onClose, onGo }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onGo(-1);
      if (e.key === "ArrowRight") onGo(1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onGo]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" onClick={onClose} aria-label="Close photo viewer" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25">
        <Icons.close />
      </button>

      <img src={photos[index]} alt={`${alt} — photo ${index + 1}`} className="max-h-[88vh] max-w-full rounded-xl object-contain" />

      {photos.length > 1 && (
        <>
          <Arrow dir={-1} onClick={() => onGo(-1)} className="absolute left-4 top-1/2 -translate-y-1/2" />
          <Arrow dir={1} onClick={() => onGo(1)} className="absolute right-4 top-1/2 -translate-y-1/2" />
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
            {index + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}

export default function Gallery({ images, alt }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState({}); // photo URLs that failed to load

  const photos = images.filter((u) => !broken[u]);
  const count = photos.length;
  const safeIndex = count ? Math.min(index, count - 1) : 0;

  useEffect(() => {
    setIndex(0);
  }, [images]);

  const go = useCallback((d) => setIndex((i) => (count ? (i + d + count) % count : 0)), [count]);

  /* ---------- no photos ---------- */
  if (count === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-[24px] border border-[#efece6] bg-gradient-to-b from-[#f4f2ee] to-[#e4e6ea] text-center text-[#b9b4a9]">
        <div>
          <svg className="mx-auto" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 16l1.5-5A2 2 0 018.4 9.5h7.2a2 2 0 011.9 1.5L19 16M4 16h16v3h-2.5v-1.5h-11V19H4v-3z" />
            <path d="M7.5 13h.01M16.5 13h.01" />
          </svg>
          <p className="mt-3 text-sm font-medium text-[#a8a59e]">No photos yet</p>
          <p className="mt-1 text-xs text-[#c0bcb2]">The seller hasn't added pictures to this listing.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      aria-label="Photo gallery"
      className="outline-none"
    >
      {/* main photo */}
      <div className="group relative aspect-[16/10] overflow-hidden rounded-[24px] border border-[#efece6] bg-gradient-to-b from-[#f4f2ee] to-[#e4e6ea]">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open full-screen photo viewer" className="block h-full w-full cursor-zoom-in">
          <img
            key={photos[safeIndex]}
            src={photos[safeIndex]}
            alt={`${alt} — photo ${safeIndex + 1}`}
            onError={() => setBroken((b) => ({ ...b, [photos[safeIndex]]: true }))}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>

        {count > 1 && (
          <>
            <Arrow dir={-1} onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-visible:opacity-100" />
            <Arrow dir={1} onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-visible:opacity-100" />
          </>
        )}

        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {safeIndex + 1} / {count}
        </span>
      </div>

      {/* thumbnails */}
      {count > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === safeIndex}
              className={`h-[72px] w-[104px] shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === safeIndex ? "border-[#1a6bff] opacity-100" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && <Lightbox photos={photos} index={safeIndex} alt={alt} onClose={() => setOpen(false)} onGo={go} />}
    </div>
  );
}