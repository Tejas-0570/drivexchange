// src/components/details/CarInfo.jsx
// Key specs strip, description, full specification table and safety tips.
import { useState } from "react";
import { Card, Icons } from "../dashboard/ui";
import { formatMileage } from "../dashboard/format";
import { Glyph } from "../listcar/Steps";

const FUEL_GLYPH = { petrol: "pump", diesel: "drop", electric: "bolt", hybrid: "leaf", cng: "flame" };

/* ---------------- key specs strip ---------------- */
const Item = ({ glyph, label, value, className = "" }) => (
  <div className={`flex items-center gap-3 rounded-xl border border-[#efece6] bg-white p-4 ${className}`}>
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e8f0ff] text-[#1a6bff]">
      <Glyph name={glyph} />
    </span>
    <div className="min-w-0">
      <p className="text-xs text-[#8c8c8c]">{label}</p>
      <p className="break-words text-[15px] font-semibold leading-snug text-[#1c1c1e]">{value || "—"}</p>
    </div>
  </div>
);

export function KeySpecs({ car }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Item glyph="calendar" label="Year" value={car.year} />
      <Item glyph="gauge" label="Mileage" value={car.mileage != null ? formatMileage(car.mileage) : ""} />
      <Item glyph={FUEL_GLYPH[car.fuelType.toLowerCase()] ?? "pump"} label="Fuel" value={car.fuelType} />
      <Item glyph={car.transmission.toLowerCase() === "manual" ? "manual" : "auto"} label="Transmission" value={car.transmission} />
      <Item className="col-span-2" glyph="palette" label="Colour" value={car.color} />
    </div>
  );
}

/* ---------------- section wrapper ---------------- */
const Section = ({ title, children }) => (
  <Card className="p-6 sm:p-7">
    <h2 className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">{title}</h2>
    <div className="mt-4">{children}</div>
  </Card>
);

/* ---------------- description ---------------- */
export function Description({ text }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 320;

  return (
    <Section title="About this car">
      {text ? (
        <>
          <p className={`whitespace-pre-line text-[15px] leading-7 text-[#5f5f5f] ${long && !expanded ? "line-clamp-5" : ""}`}>
            {text}
          </p>
          {long && (
            <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-3 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-[#a8a59e]">The seller hasn't added a description yet.</p>
      )}
    </Section>
  );
}

/* ---------------- spec table ---------------- */
function CopyVin({ vin }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(vin);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-[13px]">{vin}</span>
      <button type="button" onClick={copy} className="rounded-md bg-[#faf8f4] px-2 py-1 text-[11px] font-semibold text-[#1a6bff] transition hover:bg-[#e8f0ff]">
        {copied ? "Copied!" : "Copy"}
      </button>
    </span>
  );
}

export function SpecTable({ car }) {
  const rows = [
    ["Brand", car.brand],
    ["Model", car.model],
    ["Year", car.year],
    ["Colour", car.color],
    ["Mileage", car.mileage != null ? formatMileage(car.mileage) : ""],
    ["Fuel type", car.fuelType],
    ["Transmission", car.transmission],
    ["VIN", car.vin ? <CopyVin vin={car.vin} /> : ""],
  ];

  return (
    <Section title="Specifications">
      <dl className="grid sm:grid-cols-2 sm:gap-x-10">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-[#f1eee8] py-3 text-sm">
            <dt className="text-[#8c8c8c]">{label}</dt>
            <dd className="min-w-0 break-words text-right font-medium text-[#1c1c1e]">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ---------------- safety tips ---------------- */
const TIPS = [
  "Meet in a busy public place, in daylight, and bring a friend if you can.",
  "Inspect the car in person and take a test drive before paying anything.",
  "Check that the VIN on the car matches the VIN in this listing and the papers.",
  "Verify the registration and ownership documents before you agree on a price.",
  "Never send money in advance to someone you haven't met.",
];

export function SafetyTips() {
  return (
    <div className="rounded-2xl border border-[#cfe8e3] bg-[#f4faf9] p-6">
      <h2 className="flex items-center gap-2 font-['Fraunces',Georgia,serif] text-lg font-bold text-[#0f766e]">
        <Icons.shield /> Buy safely
      </h2>
      <ul className="mt-3 space-y-2.5">
        {TIPS.map((t) => (
          <li key={t} className="flex items-start gap-2.5 text-sm leading-6 text-[#3d6b66]">
            <Icons.check width={14} height={14} className="mt-1.5 shrink-0 text-[#0f9d8a]" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}