// src/components/browse/FiltersPanel.jsx
import { Card } from "../dashboard/ui";
import { formatMileage } from "../dashboard/format";
import { useDebouncedField } from "../../hooks/useDebouncedField";
import { FUEL_TYPES, MILEAGE_OPTIONS, TRANSMISSIONS, YEARS } from "./browseConfig";

const Section = ({ title, children }) => (
  <div className="border-b border-[#f1eee8] py-5 first:pt-0 last:border-0 last:pb-0">
    <h3 className="mb-3 text-sm font-semibold text-[#1c1c1e]">{title}</h3>
    {children}
  </div>
);

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
      active
        ? "border-[#1a6bff] bg-[#1a6bff] text-white shadow-[0_4px_12px_rgba(26,107,255,0.25)]"
        : "border-[#e6e2da] bg-white text-[#5f5f5f] hover:border-[#b9cffb] hover:text-[#1a6bff]"
    }`}
  >
    {children}
  </button>
);

const selectClass =
  "w-full appearance-none rounded-xl border border-[#e6e2da] bg-white px-4 py-3 pr-10 text-sm text-[#1c1c1e] outline-none transition focus:border-[#1a6bff] focus:shadow-[0_0_0_4px_rgba(26,107,255,0.12)]";

const Chevron = () => (
  <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const digits = (v) => v.replace(/\D/g, "").slice(0, 8);

function PriceInput({ placeholder, value, onChange, label }) {
  return (
    <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#e6e2da] bg-white px-3 transition focus-within:border-[#1a6bff] focus-within:shadow-[0_0_0_4px_rgba(26,107,255,0.12)]">
      <span className="text-sm text-[#9a9a9a]">₹</span>
      <input
        aria-label={label}
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(digits(e.target.value))}
        className="w-full min-w-0 bg-transparent py-3 text-sm outline-none placeholder:text-[#b3b0a9]"
      />
    </label>
  );
}

export default function FiltersPanel({ filters, onChange, onClear, activeCount }) {
  // price boxes update instantly but only filter after a short pause
  const [minPrice, setMinPrice] = useDebouncedField(filters.minPrice, (v) => onChange({ minPrice: v }), 500);
  const [maxPrice, setMaxPrice] = useDebouncedField(filters.maxPrice, (v) => onChange({ maxPrice: v }), 500);

  const toggle = (key, value) => onChange({ [key]: filters[key] === value ? "" : value });

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">Filters</h2>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
            Clear all
          </button>
        )}
      </div>

      <Section title="Fuel type">
        <div className="flex flex-wrap gap-2">
          {FUEL_TYPES.map((f) => (
            <Chip key={f.value} active={filters.fuelType === f.value} onClick={() => toggle("fuelType", f.value)}>
              {f.value}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Transmission">
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((t) => (
            <Chip key={t.value} active={filters.transmission === t.value} onClick={() => toggle("transmission", t.value)}>
              {t.value}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="Price (₹)">
        <div className="flex items-center gap-2">
          <PriceInput label="Minimum price" placeholder="Min" value={minPrice} onChange={setMinPrice} />
          <span className="text-[#b3b0a9]">–</span>
          <PriceInput label="Maximum price" placeholder="Max" value={maxPrice} onChange={setMaxPrice} />
        </div>
      </Section>

      <Section title="Model year">
        <div className="relative">
          <select aria-label="Minimum model year" value={filters.minYear} onChange={(e) => onChange({ minYear: e.target.value })} className={selectClass}>
            <option value="">Any year</option>
            {YEARS.map((y) => (<option key={y} value={y}>{y} or newer</option>))}
          </select>
          <Chevron />
        </div>
      </Section>

      <Section title="Distance driven">
        <div className="relative">
          <select aria-label="Maximum mileage" value={filters.maxMileage} onChange={(e) => onChange({ maxMileage: e.target.value })} className={selectClass}>
            <option value="">Any mileage</option>
            {MILEAGE_OPTIONS.map((m) => (<option key={m} value={m}>Up to {formatMileage(m)}</option>))}
          </select>
          <Chevron />
        </div>
      </Section>
    </Card>
  );
}
