// src/components/browse/browseConfig.js
import { formatMileage, formatPrice } from "../dashboard/format";
export { FUEL_TYPES, TRANSMISSIONS, YEARS } from "../listcar/carFormConfig";

export const PAGE_SIZE = 12;

export const DEFAULT_FILTERS = {
  q: "",
  fuelType: "",
  transmission: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxMileage: "",
  sort: "year_desc",
};

export const SORTS = [
  { value: "year_desc", label: "Newest model year" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "mileage_asc", label: "Lowest mileage" },
];

export const MILEAGE_OPTIONS = [10000, 30000, 50000, 80000, 120000];

/* URL  <->  filters ------------------------------------------------ */
export const filtersFromParams = (sp) =>
  Object.fromEntries(
    Object.keys(DEFAULT_FILTERS).map((k) => [k, sp.get(k) ?? DEFAULT_FILTERS[k]])
  );

// only non-default values go into the URL, so it stays short and clean
export const paramsFromFilters = (f) =>
  Object.fromEntries(
    Object.entries(f).filter(([k, v]) => v !== "" && v !== DEFAULT_FILTERS[k])
  );

export const activeFilterCount = (f) =>
  ["fuelType", "transmission", "minYear", "maxMileage"].filter((k) => f[k]).length +
  (f.minPrice || f.maxPrice ? 1 : 0);

/* chips shown above the results ------------------------------------ */
export function describeFilters(f) {
  const chips = [];
  if (f.q) chips.push({ key: "q", label: `“${f.q}”`, patch: { q: "" } });
  if (f.fuelType) chips.push({ key: "fuel", label: f.fuelType, patch: { fuelType: "" } });
  if (f.transmission) chips.push({ key: "trans", label: f.transmission, patch: { transmission: "" } });
  if (f.minPrice || f.maxPrice) {
    const from = f.minPrice ? formatPrice(f.minPrice) : "Any";
    const to = f.maxPrice ? formatPrice(f.maxPrice) : "Any";
    chips.push({ key: "price", label: `${from} – ${to}`, patch: { minPrice: "", maxPrice: "" } });
  }
  if (f.minYear) chips.push({ key: "year", label: `${f.minYear} or newer`, patch: { minYear: "" } });
  if (f.maxMileage) chips.push({ key: "mileage", label: `Up to ${formatMileage(f.maxMileage)}`, patch: { maxMileage: "" } });
  return chips;
}