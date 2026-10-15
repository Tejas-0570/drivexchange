// src/components/details/SellerCard.jsx
// Price + seller + contact actions (the sticky card on desktop).
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, Icons, Pill } from "../dashboard/ui";
import { formatMonthYear, formatPrice } from "../dashboard/format";

const STATUS = {
  AVAILABLE: { label: "Available", tone: "green" },
  RESERVED: { label: "Reserved", tone: "amber" },
  SOLD: { label: "Sold", tone: "gray" },
};

export default function SellerCard({ car, isOwner, isLoggedIn }) {
  const location = useLocation();
  const [showPhone, setShowPhone] = useState(false);

  const { seller } = car;
  const status = STATUS[car.status] ?? STATUS.AVAILABLE;
  const available = car.status === "AVAILABLE";
  const initial = (seller.name || "S")[0].toUpperCase();

  const mailto =
    `mailto:${seller.email}?subject=${encodeURIComponent(`Interested in your ${car.name}`)}` +
    `&body=${encodeURIComponent(`Hi ${seller.name || ""},\n\nI'm interested in your ${car.headline || car.name} listed on Drivexchange:\n${window.location.href}\n\nIs it still available?`)}`;

  return (
    <Card id="contact-card" className="p-6">
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

      {/* seller */}
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#1a6bff] to-[#0b57ef] text-lg font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#1c1c1e]">{seller.name || "Private seller"}</p>
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
            <Link to="/dashboard?tab=listings" className="flex w-full items-center justify-center rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0f5ae6]">
              Manage in dashboard
            </Link>
          </>
        ) : !available ? (
          <div className="rounded-xl bg-[#efece6] px-4 py-3 text-sm text-[#6b6b6b]">
            This car is no longer available.
          </div>
        ) : !isLoggedIn ? (
          <>
            <Link
              to="/login"
              state={{ from: location }}
              className="flex w-full items-center justify-center rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6]"
            >
              Log in to contact seller
            </Link>
            <p className="text-center text-xs text-[#8c8c8c]">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">Create a free account</Link>
            </p>
          </>
        ) : (
          <>
            {seller.mobile &&
              (showPhone ? (
                <a href={`tel:${seller.mobile}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:bg-[#0f5ae6]">
                  <Icons.phone /> {seller.mobile}
                </a>
              ) : (
                <button type="button" onClick={() => setShowPhone(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6]">
                  <Icons.phone /> Show phone number
                </button>
              ))}

            {seller.email && (
              <a href={mailto} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e6e2da] bg-white py-3.5 text-[15px] font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff] hover:text-[#1a6bff]">
                <Icons.mail /> Email seller
              </a>
            )}

            {!seller.mobile && !seller.email && (
              <p className="rounded-xl bg-[#efece6] px-4 py-3 text-sm text-[#6b6b6b]">
                The seller hasn't shared contact details yet.
              </p>
            )}
          </>
        )}
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#a8a59e]">
        <Icons.shield width={14} height={14} className="mt-0.5 shrink-0" />
        Always see the car and the papers in person before you pay.
      </p>
    </Card>
  );
}