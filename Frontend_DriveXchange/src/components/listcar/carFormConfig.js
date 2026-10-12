// src/components/listcar/carFormConfig.js
// Everything about the "list a car" form that is NOT UI:
// steps, option lists, validation, and the exact JSON sent to the backend.

export const STEPS = [
  {
    id: "vehicle",
    label: "Vehicle",
    title: "Tell us about your car",
    subtitle: "Start with the basics — make, model and year.",
  },
  {
    id: "specs",
    label: "Specs",
    title: "Specs & condition",
    subtitle: "How the car drives and how much it has been used.",
  },
  {
    id: "pricing",
    label: "Pricing",
    title: "Price & description",
    subtitle: "Set your price and tell buyers what makes this car special.",
  },
  {
    id: "review",
    label: "Review",
    title: "Review & publish",
    subtitle: "Check everything once more before it goes live.",
  },
];

export const INITIAL_VALUES = {
  brand: "",
  model: "",
  year: "",
  color: "",
  vin: "",
  mileage: "",
  fuelType: "",
  transmission: "",
  price: "",
  title: "",
  description: "",
  confirm: false,
};

/* ---------------- option lists ---------------- */
const thisYear = new Date().getFullYear();
// next model year down to 1990
export const YEARS = Array.from({ length: thisYear + 1 - 1990 + 1 }, (_, i) => thisYear + 1 - i);

export const BRANDS = [
  "Audi", "BMW", "Chevrolet", "Ford", "Honda", "Hyundai", "Kia", "Mahindra", "Maruti Suzuki",
  "Mazda", "Mercedes-Benz", "Nissan", "Tata", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

export const COLORS = [
  { name: "Pearl White", hex: "#f3f1ec" },
  { name: "Shadow Black", hex: "#16181b" },
  { name: "Silver", hex: "#c4c7cc" },
  { name: "Graphite Grey", hex: "#5a5f66" },
  { name: "Ocean Blue", hex: "#1f4fa3" },
  { name: "Racing Red", hex: "#c62828" },
  { name: "Forest Green", hex: "#2e5d3a" },
  { name: "Desert Brown", hex: "#8a6a4a" },
];

export const FUEL_TYPES = [
  { value: "Petrol", glyph: "pump" },
  { value: "Diesel", glyph: "drop" },
  { value: "Electric", glyph: "bolt" },
  { value: "Hybrid", glyph: "leaf" },
  { value: "CNG", glyph: "flame" },
];

export const TRANSMISSIONS = [
  { value: "Manual", glyph: "manual", hint: "You change the gears" },
  { value: "Automatic", glyph: "auto", hint: "Changes gears for you" },
];

/* ---------------- validation ---------------- */
const trim = (s) => String(s ?? "").trim();

export function validateStep(stepId, v) {
  const e = {};

  if (stepId === "vehicle") {
    if (trim(v.brand).length < 2) e.brand = "Enter the car brand";
    if (!trim(v.model)) e.model = "Enter the model";
    if (!v.year) e.year = "Select the manufacturing year";
    if (trim(v.color).length < 3) e.color = "Enter the car colour";
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(trim(v.vin))) {
      e.vin = "VIN must be 17 letters/numbers (I, O and Q aren't used)";
    }
  }

  if (stepId === "specs") {
    if (v.mileage === "") e.mileage = "Enter the distance driven";
    else if (Number(v.mileage) > 999999) e.mileage = "That mileage looks too high";
    if (!v.fuelType) e.fuelType = "Choose a fuel type";
    if (!v.transmission) e.transmission = "Choose a transmission";
  }

  if (stepId === "pricing") {
    if (v.price === "") e.price = "Enter your asking price";
    else if (Number(v.price) < 1) e.price = "Price must be greater than 0";
    else if (Number(v.price) > 10000000) e.price = "That price looks too high";

    const title = trim(v.title);
    if (title.length < 10) e.title = "Write a title of at least 10 characters";
    else if (title.length > 100) e.title = "Keep the title under 100 characters";

    const desc = trim(v.description);
    if (desc.length < 30) e.description = "Add at least 30 characters so buyers know more";
    else if (desc.length > 1000) e.description = "Keep the description under 1000 characters";
  }

  if (stepId === "review") {
    if (!v.confirm) e.confirm = "Please confirm the details are accurate";
  }

  return e;
}

// first step (index) that has a problem, or -1
export function firstInvalidStep(v) {
  return STEPS.slice(0, 3).findIndex((s) => Object.keys(validateStep(s.id, v)).length > 0);
}

export const suggestTitle = (v) =>
  [v.year, trim(v.brand), trim(v.model)].filter(Boolean).join(" ");

/* ---------------- request body ----------------
   Keys match your Postman request exactly (snake_case). */
export function buildPayload(v) {
  return {
    vin: trim(v.vin).toUpperCase(),
    brand: trim(v.brand),
    model: trim(v.model),
    manufactured_year: Number(v.year),
    color: trim(v.color),
    mileage: Number(v.mileage),
    fuel_type: v.fuelType,
    transmission_type: v.transmission,
    price: Number(v.price),
    status: "Available", // not chosen by the user
    title_header: trim(v.title),
    description: trim(v.description),
  };
}