// src/components/dashboard/CarTile.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Icons, Pill } from "./ui";
import { formatMileage, formatPrice } from "./format";

const STATUS = {
  ACTIVE: { label: "Active", tone: "green" },
  PENDING: { label: "Under review", tone: "amber" },
  SOLD: { label: "Sold", tone: "gray" },
};

export default function CarTile({ car, showStatus = false }) {
  const [imgFailed, setImgFailed] = useState(false);
  const status = STATUS[car.status] ?? STATUS.ACTIVE;
  const specs = [
    car.mileage != null && formatMileage(car.mileage),
    car.fuelType,
    car.transmission,
  ].filter(Boolean);

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
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-[17px] font-semibold text-[#1c1c1e]">{car.name}</h3>
          <span className="whitespace-nowrap font-['Fraunces',Georgia,serif] text-lg font-bold text-[#1a6bff]">
            {formatPrice(car.price)}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[#8c8c8c]">
          {[car.year, car.location].filter(Boolean).join(" · ") || "—"}
        </p>

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
      </div>
    </article>
  );
}