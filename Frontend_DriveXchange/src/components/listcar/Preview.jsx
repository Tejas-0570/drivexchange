// src/components/listcar/Preview.jsx
// Live card that fills in while the user types (desktop side panel).
import { Card, Icons } from "../dashboard/ui";
import { formatMileage, formatPrice } from "../dashboard/format";

const TIPS = {
  vehicle: [
    "Double-check the VIN — buyers use it to verify the car's history.",
    "Use the exact model name as printed on the registration papers.",
  ],
  specs: [
    "Be accurate with mileage; buyers compare it against service records.",
    "Pick the fuel type and transmission exactly as the car is.",
  ],
  photos: [
    "Shoot in daylight and keep the whole car in the frame.",
    "Add the interior and dashboard — buyers look for them first.",
  ],
  pricing: [
    "Price close to similar cars in your area to get more enquiries.",
    "Mention service history, recent repairs and extras in the description.",
  ],
  review: [
    "Read through the summary once more — you can edit any section.",
    "You can edit or remove the listing later from My Listings.",
  ],
};

const TRACKED = ["brand", "model", "year", "color", "vin", "mileage", "fuelType", "transmission", "price", "title", "description"];

export default function Preview({ values, stepId, coverUrl = null }) {
  const name = [values.brand, values.model].filter(Boolean).join(" ") || "Your car";
  const cover = values.photos?.[0]?.url ?? coverUrl;
  const filled =
    TRACKED.filter((k) => String(values[k]).trim() !== "").length + (values.photos?.length ? 1 : 0);
  const percent = Math.round((filled / (TRACKED.length + 1)) * 100);

  const specs = [
    values.mileage !== "" && formatMileage(values.mileage),
    values.fuelType,
    values.transmission,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#a8a59e]">Live preview</p>

        <article className="overflow-hidden rounded-2xl border border-[#efece6] bg-white shadow-[0_10px_28px_rgba(30,25,15,0.08)]">
          <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-gradient-to-b from-[#f4f2ee] to-[#e4e6ea] text-[#b9b4a9]">
            {cover ? (
              <img src={cover} alt="Cover photo" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Icons.car width={56} height={56} />
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f766e]">
              <Icons.check width={11} height={11} /> Available
            </span>
          </div>

          <div className="p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className={`truncate text-[17px] font-semibold ${values.brand || values.model ? "text-[#1c1c1e]" : "text-[#c9c5bb]"}`}>
                {name}
              </h3>
              <span className={`whitespace-nowrap font-['Fraunces',Georgia,serif] text-lg font-bold ${values.price ? "text-[#1a6bff]" : "text-[#c9c5bb]"}`}>
                {values.price ? formatPrice(values.price) : "₹0"}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-[#8c8c8c]">
              {[values.year, values.color].filter(Boolean).join(" · ") || "Year · Colour"}
            </p>
            {values.title && <p className="mt-1 truncate text-xs text-[#a8a59e]">{values.title}</p>}
            <p className="mt-3 truncate border-t border-[#eeeeee] pt-3 text-xs text-[#8a8a8a]">
              {specs.length ? specs.join("  ·  ") : "Mileage · Fuel · Transmission"}
            </p>
          </div>
        </article>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#1c1c1e]">Listing completeness</span>
          <span className="text-[#8c8c8c]">{percent}%</span>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#efece6]">
          <div className="h-full rounded-full bg-[#0f9d8a] transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>

        <ul className="mt-4 space-y-2.5">
          {(TIPS[stepId] ?? TIPS.vehicle).map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-xs leading-5 text-[#6b6b6b]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1a6bff]" />
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
