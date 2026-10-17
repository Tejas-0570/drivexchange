// src/components/dashboard/CarTile.jsx
// Used in two places:
//   My Listings -> <CarTile car showStatus onDelete={...} />   (shows Edit + Delete)
//   Saved Cars  -> <CarTile car onRemove={...} />              (shows a filled heart to un-save)
import { useState } from "react";
import { Link } from "react-router-dom";
import { Icons, Pill } from "./ui";
import { formatMileage, formatPrice } from "./format";

const STATUS = {
  ACTIVE: { label: "Active", tone: "green" },
  AVAILABLE: { label: "Available", tone: "green" },
  RESERVED: { label: "Reserved", tone: "amber" },
  PENDING: { label: "Under review", tone: "amber" },
  SOLD: { label: "Sold", tone: "gray" },
  INACTIVE: { label: "Removed", tone: "gray" },
};

// a reserved car has a buyer's money on hold and a sold car is history -> owner can't change them
const LOCKED = ["RESERVED", "SOLD"];
const LOCK_REASON = {
  RESERVED: "A buyer has reserved this car, so it can't be changed right now.",
  SOLD: "This car is sold, so the listing can't be changed.",
};

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </svg>
);

export default function CarTile({ car, showStatus = false, onRemove, onDelete }) {
  const [imgFailed, setImgFailed] = useState(false);
  const status = STATUS[car.status] ?? STATUS.ACTIVE;
  const locked = LOCKED.includes(car.status);
  const specs = [
    car.mileage != null && formatMileage(car.mileage),
    car.fuelType,
    car.transmission,
  ].filter(Boolean);

  const manageBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition";
  const disabledBtn = "cursor-not-allowed border-[#efece6] bg-[#faf8f4] text-[#b3b0a9]";

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#efece6] bg-white shadow-[0_2px_10px_rgba(30,25,15,0.05)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(30,25,15,0.1)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-b from-[#f4f2ee] to-[#e4e6ea]">
        {car.image && !imgFailed ? (
          <img
            src={car.image}
            alt={car.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-bottom transition-transform duration-500 ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[#b9b4a9]">
            <Icons.car width={44} height={44} />
          </div>
        )}
        {showStatus && (
          <span className="absolute left-3 top-3">
            <Pill tone={status.tone}>{status.label}</Pill>
          </span>
        )}

        {/* Saved Cars: filled heart = click to remove from saved */}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(car.id)}
            aria-label="Remove from saved cars"
            title="Remove from saved cars"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-red-500 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition hover:scale-110"
          >
            <Icons.heart fill="currentColor" width={18} height={18} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-[17px] font-semibold text-[#1c1c1e]">{car.name}</h3>
          <span className="whitespace-nowrap font-['Fraunces',Georgia,serif] text-lg font-bold text-[#1a6bff]">
            {formatPrice(car.price)}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[#8c8c8c]">
          {[car.year, car.color, car.location].filter(Boolean).join(" · ") || "—"}
        </p>
        {car.headline && (
          <p className="mt-1 truncate text-xs text-[#a8a59e]">{car.headline}</p>
        )}

        {specs.length > 0 && (
          <p className="mt-3 truncate border-t border-[#eeeeee] pt-3 text-xs text-[#8a8a8a]">
            {specs.join("  ·  ")}
          </p>
        )}

        <Link
          to={`/cars/${car.id}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#1a6bff] hover:text-[#0f5ae6]"
        >
          View details <Icons.arrow width={14} height={14} />
        </Link>

        {/* My Listings: Edit + Delete */}
        {onDelete && (
          <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#eeeeee] pt-4">
            {locked ? (
              <>
                <span title={LOCK_REASON[car.status]} aria-disabled="true" className={`${manageBtn} ${disabledBtn}`}>
                  <PencilIcon /> Edit
                </span>
                <span title={LOCK_REASON[car.status]} aria-disabled="true" className={`${manageBtn} ${disabledBtn}`}>
                  <TrashIcon /> Delete
                </span>
              </>
            ) : (
              <>
                <Link
                  to={`/cars/${car.id}/edit`}
                  className={`${manageBtn} border-[#e6e2da] bg-white text-[#1c1c1e] hover:border-[#1a6bff] hover:text-[#1a6bff]`}
                >
                  <PencilIcon /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(car)}
                  className={`${manageBtn} border-red-200 bg-white text-red-600 hover:bg-red-50`}
                >
                  <TrashIcon /> Delete
                </button>
              </>
            )}
            {locked && (
              <p className="col-span-2 text-xs leading-5 text-[#a8a59e]">{LOCK_REASON[car.status]}</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
