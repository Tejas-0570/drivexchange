// src/components/listcar/Steps.jsx
// The four screens of the wizard + the small form controls they use.
import { useRef, useState } from "react";
import { Field } from "../AuthLayout";
import { Icons } from "../dashboard/ui";
import { formatMileage, formatPrice } from "../dashboard/format";
import {
  acceptPhotos,
  BRANDS,
  COLORS,
  FUEL_TYPES,
  MAX_PHOTO_MB,
  MAX_PHOTOS,
  suggestTitle,
  TRANSMISSIONS,
  YEARS,
} from "./carFormConfig";

/* ------------------------------------------------------------------ */
/* glyphs (small line icons)                                          */
/* ------------------------------------------------------------------ */
export function Glyph({ name, size = 18 }) {
  const paths = {
    calendar: (<><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
    palette: (<><path d="M12 3a9 9 0 100 18c1.4 0 2-.9 2-1.8 0-1-.8-1.4-.8-2.3 0-.9.7-1.4 1.6-1.4H17a4 4 0 004-4c0-4.4-4-8.5-9-8.5z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>),
    hash: <path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16" />,
    gauge: (<><path d="M4 17a9 9 0 1116 0" /><path d="M12 13l4-4" /></>),
    title: <path d="M4 7h16M4 12h10M4 17h7" />,
    dollar: <path d="M12 3v18M16.5 7.5C15.5 6.4 14 6 12 6c-2.5 0-4 1.1-4 3 0 4.2 8.5 2 8.5 6.5 0 1.9-1.7 3-4.5 3-2 0-3.7-.6-4.8-1.8" />,
    pump: (<><path d="M5 20V5a1.5 1.5 0 011.5-1.5h6A1.5 1.5 0 0114 5v15M4 20h11M14 9h2.5a1.5 1.5 0 011.5 1.5v5a1.5 1.5 0 003 0V9l-3-3" /><path d="M7 8h5" /></>),
    drop: <path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z" />,
    bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
    leaf: <path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8" />,
    flame: <path d="M12 3c1 4 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 1.5.5 2 1.5 2C10 8 10.5 5 12 3z" />,
    manual: (<><circle cx="6" cy="5" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="18" cy="5" r="2" /><path d="M6 7v10M12 7v10M18 7v10M6 12h12" /></>),
    auto: <path d="M5 20L12 4l7 16M8 14h8" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* form controls                                                      */
/* ------------------------------------------------------------------ */
const wrapperClass = (error) =>
  `group relative flex items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:border-[#1a6bff] focus-within:shadow-[0_0_0_4px_rgba(26,107,255,0.12)] ${
    error ? "border-red-400" : "border-[#e6e2da]"
  }`;

const labelClass = "mb-2 block text-sm font-medium text-[#1c1c1e]";
const ErrorText = ({ children }) =>
  children ? <p className="mt-1.5 text-xs text-red-500">{children}</p> : null;

function SelectField({ id, label, icon, error, value, onChange, placeholder, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className={wrapperClass(error)}>
        <span className="text-[#9a9a9a] transition-colors group-focus-within:text-[#1a6bff]">{icon}</span>
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none bg-transparent py-3.5 pr-8 text-[15px] outline-none ${value ? "text-[#1c1c1e]" : "text-[#b3b0a9]"}`}
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
        <svg className="pointer-events-none absolute right-4 text-[#9a9a9a]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function TextAreaField({ id, label, error, value, onChange, placeholder, max, hint }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className={`${wrapperClass(error)} items-start py-1`}>
        <textarea
          id={id}
          rows={6}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={max}
          className="w-full resize-none bg-transparent py-3 text-[15px] leading-6 text-[#1c1c1e] outline-none placeholder:text-[#b3b0a9]"
        />
      </div>
      <div className="mt-1.5 flex items-start justify-between gap-4">
        <div className="text-xs text-red-500">{error}</div>
        <div className="shrink-0 text-xs text-[#a8a59e]">
          {!error && hint ? <span className="mr-3">{hint}</span> : null}
          {value.length}/{max}
        </div>
      </div>
    </div>
  );
}

function ChoiceCards({ legend, options, value, onChange, error, cols = "grid-cols-2 sm:grid-cols-3" }) {
  return (
    <fieldset>
      <legend className={labelClass}>{legend}</legend>
      <div role="radiogroup" aria-label={legend} className={`grid gap-3 ${cols}`}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                active
                  ? "border-[#1a6bff] bg-[#f2f7ff] shadow-[0_6px_16px_rgba(26,107,255,0.15)]"
                  : "border-[#e6e2da] bg-white hover:-translate-y-0.5 hover:border-[#b9cffb]"
              }`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${active ? "bg-[#1a6bff] text-white" : "bg-[#faf8f4] text-[#6b6b6b]"}`}>
                <Glyph name={o.glyph} />
              </span>
              <span>
                <span className={`block text-[15px] font-semibold ${active ? "text-[#1a6bff]" : "text-[#1c1c1e]"}`}>{o.value}</span>
                {o.hint && <span className="mt-0.5 block text-xs text-[#8c8c8c]">{o.hint}</span>}
              </span>
              {active && (
                <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-[#1a6bff] text-white">
                  <Icons.check width={11} height={11} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <ErrorText>{error}</ErrorText>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* STEP 1 — Vehicle                                                   */
/* ------------------------------------------------------------------ */
export function StepVehicle({ values, errors, onChange, editing = false }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="brand"
          label="Brand"
          list="brand-list"
          placeholder="e.g. Ford"
          icon={<Icons.car />}
          value={values.brand}
          onChange={(e) => onChange("brand", e.target.value)}
          error={errors.brand}
          autoComplete="off"
          autoFocus
        />
        <datalist id="brand-list">
          {BRANDS.map((b) => (<option key={b} value={b} />))}
        </datalist>

        <Field
          id="model"
          label="Model"
          placeholder="e.g. Mustang GT"
          icon={<Glyph name="title" />}
          value={values.model}
          onChange={(e) => onChange("model", e.target.value)}
          error={errors.model}
          autoComplete="off"
        />
      </div>

      <SelectField
        id="year"
        label="Manufactured year"
        icon={<Glyph name="calendar" />}
        placeholder="Select year"
        value={values.year}
        onChange={(e) => onChange("year", e.target.value)}
        error={errors.year}
      >
        {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
      </SelectField>

      <div>
        <Field
          id="color"
          label="Colour"
          placeholder="e.g. Shadow Black"
          icon={<Glyph name="palette" />}
          value={values.color}
          onChange={(e) => onChange("color", e.target.value)}
          error={errors.color}
          autoComplete="off"
        />
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Quick colour picks">
          {COLORS.map((c) => {
            const active = values.color.trim().toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onChange("color", c.name)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active ? "border-[#1a6bff] bg-[#f2f7ff] text-[#1a6bff]" : "border-[#e6e2da] bg-white text-[#5f5f5f] hover:border-[#b9cffb]"
                }`}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c.hex }} />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Field
          id="vin"
          label="VIN / Chassis number"
          placeholder="17-character VIN"
          icon={<Glyph name="hash" />}
          value={values.vin}
          onChange={(e) => onChange("vin", e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 17))}
          error={errors.vin}
          maxLength={17}
          autoComplete="off"
          spellCheck={false}
          readOnly={editing}
          right={
            editing ? (
              <span className="text-xs font-semibold text-[#a8a59e]">Locked</span>
            ) : (
              <span className="text-xs tabular-nums text-[#a8a59e]">{values.vin.length}/17</span>
            )
          }
        />
        {!errors.vin && (
          <p className="mt-1.5 text-xs text-[#a8a59e]">
            {editing
              ? "The VIN identifies the car, so it can't be changed. If it's wrong, remove this listing and list the car again."
              : "Found on the dashboard near the windshield or on the registration papers."}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* STEP 2 — Specs                                                     */
/* ------------------------------------------------------------------ */
export function StepSpecs({ values, errors, onChange }) {
  return (
    <div className="space-y-6">
      <Field
        id="mileage"
        label="Distance driven"
        inputMode="numeric"
        placeholder="e.g. 34200"
        icon={<Glyph name="gauge" />}
        value={values.mileage}
        onChange={(e) => onChange("mileage", e.target.value.replace(/\D/g, "").slice(0, 6))}
        error={errors.mileage}
        autoComplete="off"
        autoFocus
        right={<span className="text-sm text-[#a8a59e]">mi</span>}
      />

      <ChoiceCards
        legend="Fuel type"
        options={FUEL_TYPES}
        value={values.fuelType}
        onChange={(v) => onChange("fuelType", v)}
        error={errors.fuelType}
      />

      <ChoiceCards
        legend="Transmission"
        options={TRANSMISSIONS}
        value={values.transmission}
        onChange={(v) => onChange("transmission", v)}
        error={errors.transmission}
        cols="grid-cols-1 sm:grid-cols-2"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* STEP 3 — Photos (optional)                                         */
/* ------------------------------------------------------------------ */
export function StepPhotos({ values, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [notes, setNotes] = useState([]);
  const photos = values.photos;
  const full = photos.length >= MAX_PHOTOS;

  const addFiles = (files) => {
    if (!files || files.length === 0) return;
    const { added, rejected } = acceptPhotos(files, photos);
    setNotes(rejected);
    if (added.length) onChange("photos", [...photos, ...added]);
  };

  const remove = (id) => {
    const gone = photos.find((p) => p.id === id);
    if (gone) URL.revokeObjectURL(gone.url);
    setNotes([]);
    onChange("photos", photos.filter((p) => p.id !== id));
  };

  const makeCover = (id) => {
    const pick = photos.find((p) => p.id === id);
    onChange("photos", [pick, ...photos.filter((p) => p.id !== id)]);
  };

  return (
    <div className="space-y-5">
      <label
        onDragOver={(e) => { e.preventDefault(); if (!full) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!full) addFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition focus-within:border-[#1a6bff] focus-within:shadow-[0_0_0_4px_rgba(26,107,255,0.12)] ${
          full
            ? "cursor-not-allowed border-[#e6e2da] bg-[#faf8f4] opacity-70"
            : dragging
            ? "border-[#1a6bff] bg-[#f2f7ff]"
            : "border-[#d9d5cc] bg-white hover:border-[#1a6bff] hover:bg-[#f9fbff]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={full}
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = ""; // lets the user pick the same file again after removing it
          }}
        />
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f0ff] text-[#1a6bff]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <circle cx="9" cy="10" r="1.8" />
            <path d="M21 16l-5-5-8 9" />
          </svg>
        </span>
        <span className="mt-4 text-[15px] font-semibold text-[#1c1c1e]">
          {full ? "You've added the maximum number of photos" : "Drag photos here, or click to browse"}
        </span>
        <span className="mt-1.5 text-xs text-[#8c8c8c]">
          JPG, PNG or WebP · up to {MAX_PHOTO_MB} MB each · max {MAX_PHOTOS} photos
        </span>
      </label>

      {notes.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {notes.map((n) => (<li key={n}>{n}</li>))}
        </ul>
      )}

      {photos.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between text-xs text-[#8c8c8c]">
            <span className="font-semibold text-[#1c1c1e]">{photos.length} of {MAX_PHOTOS} photos</span>
            <span>The first photo is the cover.</span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p, i) => (
              <li key={p.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#efece6] bg-[#f4f2ee]">
                <img src={p.url} alt={`Car photo ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#1a6bff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#1c1c1e] shadow transition hover:bg-red-50 hover:text-red-600"
                >
                  <Icons.close width={14} height={14} />
                </button>
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(p.id)}
                    className="absolute inset-x-2 bottom-2 rounded-lg bg-white/95 py-1.5 text-[11px] font-semibold text-[#1c1c1e] opacity-0 shadow transition hover:text-[#1a6bff] focus:opacity-100 group-hover:opacity-100"
                  >
                    Make cover
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-[#a8a59e]">
        You can skip this step. Bright, daylight shots of the front, back, sides and interior work best.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* STEP 4 — Pricing & description                                     */
/* ------------------------------------------------------------------ */
export function StepPricing({ values, errors, onChange }) {
  const suggestion = suggestTitle(values);

  return (
    <div className="space-y-5">
      <Field
        id="price"
        label="Asking price (₹)"
        inputMode="numeric"
        placeholder="e.g. 850000"
        icon={<span className="text-base font-semibold leading-none">₹</span>}
        value={values.price}
        onChange={(e) => onChange("price", e.target.value.replace(/\D/g, "").slice(0, 9))}
        error={errors.price}
        autoComplete="off"
        autoFocus
        right={
          values.price ? (
            <span className="text-xs text-[#a8a59e]">{formatPrice(values.price)}</span>
          ) : null
        }
      />

      <div>
        <Field
          id="title"
          label="Listing title"
          placeholder="e.g. 2020 Ford Mustang GT Premium – Low Mileage"
          icon={<Glyph name="title" />}
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          error={errors.title}
          maxLength={100}
          autoComplete="off"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {suggestion && values.title.trim() !== suggestion ? (
            <button
              type="button"
              onClick={() => onChange("title", suggestion)}
              className="rounded-full border border-dashed border-[#b9cffb] bg-[#f2f7ff] px-3 py-1 text-xs font-medium text-[#1a6bff] transition hover:bg-[#e8f0ff]"
            >
              Use “{suggestion}”
            </button>
          ) : <span />}
          <span className="text-xs text-[#a8a59e]">{values.title.length}/100</span>
        </div>
      </div>

      <TextAreaField
        id="description"
        label="Description"
        placeholder="Condition, service history, features, reason for selling…"
        value={values.description}
        onChange={(e) => onChange("description", e.target.value)}
        error={errors.description}
        max={1000}
        hint="Min 30 characters"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* STEP 5 — Review                                                    */
/* ------------------------------------------------------------------ */
const ReviewRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-6 border-b border-[#f1eee8] py-3 text-sm last:border-0">
    <span className="shrink-0 text-[#8c8c8c]">{label}</span>
    <span className="min-w-0 break-words text-right font-medium text-[#1c1c1e]">{children}</span>
  </div>
);

const ReviewSection = ({ title, onEdit, children }) => (
  <section className="rounded-2xl border border-[#efece6] bg-[#fdfcfa] px-5 py-4">
    <div className="flex items-center justify-between">
      <h3 className="font-['Fraunces',Georgia,serif] text-lg font-bold text-[#1c1c1e]">{title}</h3>
      <button type="button" onClick={onEdit} className="text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
        Edit
      </button>
    </div>
    <div className="mt-1">{children}</div>
  </section>
);

export function StepReview({ values, errors, onChange, onEdit, steps, editing = false }) {
  // jump to a step by its id (the list changes in edit mode)
  const edit = (id) => () => onEdit(steps.findIndex((s) => s.id === id));

  return (
    <div className="space-y-4">
      <ReviewSection title="Vehicle" onEdit={edit("vehicle")}>
        <ReviewRow label="Car">{values.brand} {values.model}</ReviewRow>
        <ReviewRow label="Year">{values.year}</ReviewRow>
        <ReviewRow label="Colour">{values.color}</ReviewRow>
        <ReviewRow label="VIN"><span className="font-mono text-[13px]">{values.vin.toUpperCase()}</span></ReviewRow>
      </ReviewSection>

      <ReviewSection title="Specs" onEdit={edit("specs")}>
        <ReviewRow label="Distance driven">{formatMileage(values.mileage)}</ReviewRow>
        <ReviewRow label="Fuel type">{values.fuelType}</ReviewRow>
        <ReviewRow label="Transmission">{values.transmission}</ReviewRow>
      </ReviewSection>

      {!editing && (
        <ReviewSection title="Photos" onEdit={edit("photos")}>
          {values.photos.length === 0 ? (
            <p className="py-3 text-sm text-[#8c8c8c]">No photos added. You can still publish without them.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto py-3">
              {values.photos.map((p, i) => (
                <img key={p.id} src={p.url} alt={`Car photo ${i + 1}`} className="h-16 w-24 shrink-0 rounded-lg border border-[#efece6] object-cover" />
              ))}
            </div>
          )}
        </ReviewSection>
      )}

      <ReviewSection title="Pricing" onEdit={edit("pricing")}>
        <ReviewRow label="Asking price">
          <span className="font-['Fraunces',Georgia,serif] text-base font-bold text-[#1a6bff]">{formatPrice(values.price)}</span>
        </ReviewRow>
        <ReviewRow label="Title">{values.title}</ReviewRow>
        <ReviewRow label="Description">
          <span className="line-clamp-3 font-normal text-[#5f5f5f]">{values.description}</span>
        </ReviewRow>
      </ReviewSection>

      <div className="flex items-start gap-3 rounded-xl bg-[#e3f1ef] px-4 py-3 text-sm text-[#0f766e]">
        <Icons.shield width={18} height={18} className="mt-0.5 shrink-0" />
        <span>
          {editing
            ? "Saving will update your live listing straight away."
            : <>Your car will go live as <strong>Available</strong> and appear in My Listings straight away.</>}
        </span>
      </div>

      {!editing && (
        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#5f5f5f]">
            <input
              type="checkbox"
              checked={values.confirm}
              onChange={(e) => onChange("confirm", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#1a6bff]"
            />
            <span>I confirm that the details above are accurate and that I'm the owner or authorised to sell this car.</span>
          </label>
          <ErrorText>{errors.confirm}</ErrorText>
        </div>
      )}
    </div>
  );
}
