// src/components/details/ReserveCard.jsx
// Replaces SellerCard. Price + "Reserve this car". It never shows the seller's
// phone / email: buyers and sellers connect only through Drivexchange.
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, Icons, Modal, Pill } from "../dashboard/ui";
import { formatMonthYear, formatPrice } from "../dashboard/format";

const STATUS = {
  AVAILABLE: { label: "Available", tone: "green" },
  RESERVED: { label: "Reserved", tone: "amber" },
  SOLD: { label: "Sold", tone: "gray" },
};

const STEPS = [
  ["Reserve", "Pay a small, refundable booking amount to hold the car for you."],
  ["Inspect & test drive", "Meet the seller through Drivexchange and check the car in person."],
  ["Pay & take delivery", "Pay the balance. The seller is paid only after you confirm delivery."],
];

const primaryBtn =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6]";

export default function ReserveCard({ car, isOwner, isLoggedIn }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const { seller } = car;
  const status = STATUS[car.status] ?? STATUS.AVAILABLE;
  const available = car.status === "AVAILABLE";
  const initial = (seller.firstName || "S")[0].toUpperCase();

  return (
    <Card id="reserve-card" className="p-6">
      {/* price (hidden on mobile: shown in the title block + bottom bar there) */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a8a59e]">Asking price</span>
          <Pill tone={status.tone}>{status.label}</Pill>
        </div>
        <p className="mt-2 font-['Fraunces',Georgia,serif] text-4xl font-bold tracking-tight text-[#1a6bff]">
          {formatPrice(car.price)}
        </p>
        <div className="my-5 h-px bg-[#f1eee8]" />
      </div>

      {/* seller: first name only */}
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1a6bff] to-[#0b57ef] text-lg font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#1c1c1e]">{seller.firstName || "Private seller"}</p>
          <p className="text-xs text-[#8c8c8c]">
            Private seller{seller.memberSince ? ` · Member since ${formatMonthYear(seller.memberSince)}` : ""}
          </p>
        </div>
      </div>

      {/* actions */}
      <div className="mt-5 space-y-3">
        {isOwner ? (
          <>
            <div className="rounded-xl bg-[#e8f0ff] px-4 py-3 text-sm text-[#1a6bff]">This is your listing.</div>
            {available && (
              <Link to={`/cars/${car.id}/edit`} className={primaryBtn}>Edit listing</Link>
            )}
            <Link
              to="/dashboard?tab=listings"
              className="flex w-full items-center justify-center rounded-xl border border-[#e6e2da] bg-white py-3.5 text-[15px] font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff] hover:text-[#1a6bff]"
            >
              Manage in dashboard
            </Link>
          </>
        ) : !available ? (
          <div className="rounded-xl bg-[#efece6] px-4 py-3 text-sm text-[#6b6b6b]">
            {car.status === "RESERVED" ? "Someone has already reserved this car." : "This car is no longer available."}
          </div>
        ) : !isLoggedIn ? (
          <>
            <Link to="/login" state={{ from: location }} className={primaryBtn}>
              Log in to reserve
            </Link>
            <p className="text-center text-xs text-[#8c8c8c]">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">Create a free account</Link>
            </p>
          </>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className={primaryBtn}>
            <Icons.shield width={18} height={18} /> Reserve this car
          </button>
        )}
      </div>

      {/* how it works */}
      {!isOwner && available && (
        <ol className="mt-6 space-y-3.5 border-t border-[#f1eee8] pt-5">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e8f0ff] text-xs font-bold text-[#1a6bff]">
                {i + 1}
              </span>
              <p className="text-xs leading-5 text-[#6b6b6b]">
                <strong className="block text-[13px] text-[#1c1c1e]">{title}</strong>
                {text}
              </p>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#a8a59e]">
        <Icons.shield width={14} height={14} className="mt-0.5 shrink-0" />
        Pay only through Drivexchange. Never send money to a seller directly.
      </p>

      {/* placeholder until payments are built */}
      {open && (
        <Modal title="Reserve this car" subtitle={car.headline || car.name} onClose={() => setOpen(false)}>
          <p className="text-sm leading-6 text-[#5f5f5f]">
            Online booking is almost ready. Soon you'll pay a small refundable amount here to hold this car,
            and we'll connect you with the seller safely.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-6 w-full rounded-xl bg-[#1a6bff] py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6]"
          >
            Got it
          </button>
        </Modal>
      )}
    </Card>
  );
}
