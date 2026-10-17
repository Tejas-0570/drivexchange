import { useEffect, useState } from "react";

/* ---------- small inline icons (no extra dependency) ---------- */
const Icon = ({ children, size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CheckCircle = () => (
  <Icon size={16}>
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z" />
  </Icon>
);

const HeartIcon = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20.5s-7.5-4.7-9.3-9.2C1.5 8.2 3.3 5 6.6 5c2 0 3.5 1.1 5.4 3.2C13.9 6.1 15.4 5 17.4 5c3.3 0 5.1 3.2 3.9 6.3-1.8 4.5-9.3 9.2-9.3 9.2z" />
  </svg>
);

const GaugeIcon = () => (
  <Icon>
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a1.2 1.2 0 110 2.4A1.2 1.2 0 0112 6zM6.5 12a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zm11 0a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM13.1 15.3a2 2 0 11-2.2-3.3l3.6-3.3-1.4 4.9z" />
  </Icon>
);

const BoltIcon = () => (
  <Icon>
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
  </Icon>
);

const FuelIcon = () => (
  <Icon>
    <path d="M4 3h9a1 1 0 011 1v8h1.5a2 2 0 012 2v3a.5.5 0 001 0v-6l-2-2 1-1 3 3v6a2.5 2.5 0 01-5 0v-3H14v6h1v2H2v-2h1V4a1 1 0 011-1zm1.5 2v4h6V5h-6z" />
  </Icon>
);

const GearIcon = () => (
  <Icon>
    <path d="M9.5 3l.4 1.7a6 6 0 011.4.8l1.6-.6 1.5 2.6-1.3 1.1a6 6 0 010 1.6l1.3 1.1-1.5 2.6-1.6-.6a6 6 0 01-1.4.8L9.5 16h-3l-.4-1.7a6 6 0 01-1.4-.8l-1.6.6-1.5-2.6 1.3-1.1a6 6 0 010-1.6L1.6 7.7l1.5-2.6 1.6.6a6 6 0 011.4-.8L6.5 3h3zM8 8.2a2.3 2.3 0 100 4.6 2.3 2.3 0 000-4.6zM18 12.5l.3 1.2c.4.1.7.3 1 .5l1.2-.4 1.1 1.9-.9.8c.1.4.1.7 0 1.1l.9.8-1.1 1.9-1.2-.4c-.3.2-.6.4-1 .5l-.3 1.2h-2.2l-.3-1.2c-.4-.1-.7-.3-1-.5l-1.2.4-1.1-1.9.9-.8a3 3 0 010-1.1l-.9-.8 1.1-1.9 1.2.4c.3-.2.6-.4 1-.5l.3-1.2H18zm-1.1 3.4a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2z" />
  </Icon>
);

/* ---------- helpers ---------- */
const formatPrice = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatMileage = (miles) =>
  `${new Intl.NumberFormat("en-US").format(miles)} mi`;

/* ---------- the reusable component (Tailwind only) ---------- */
export default function CarCard({
  image,
  name,
  price,
  year,
  location,
  mileage,
  fuelType, // "Electric" | "Petrol" | "Diesel" | ...
  transmission, // "Auto" | "Manual"
  verified = false,
  isFavourite = false,
  onFavouriteChange,
  onClick,
}) {
  const [fav, setFav] = useState(isFavourite);
  const [imgFailed, setImgFailed] = useState(false);

  // follow the parent: the saved list may finish loading after the card appears,
  // and a failed save puts the heart back
  useEffect(() => {
    setFav(isFavourite);
  }, [isFavourite]);

  const toggleFav = (e) => {
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    onFavouriteChange?.(next);
  };

  const isElectric = fuelType?.toLowerCase() === "electric";

  return (
    <article
      onClick={onClick}
      className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[#efece6] bg-white font-['Manrope',system-ui,sans-serif] shadow-[0_2px_10px_rgba(30,25,15,0.06)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(30,25,15,0.1)]"
    >
      {/* image area: change h-[60%] to h-[70%] for a taller image */}
      <div className="group relative aspect-[16/9] shrink-0 overflow-hidden bg-gradient-to-b from-[#f4f2ee] to-[#e4e6ea]">
        {image && !imgFailed ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="block h-full w-full object-cover object-bottom transition-transform duration-500 ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[#b9b4a9]" aria-label="No photo yet">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 16l1.5-5A2 2 0 018.4 9.5h7.2a2 2 0 011.9 1.5L19 16M4 16h16v3h-2.5v-1.5h-11V19H4v-3z" />
              <path d="M7.5 13h.01M16.5 13h.01" />
            </svg>
          </div>
        )}

        {verified && (
          <span className="absolute left-3.5 top-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-white py-2 pl-2.5 pr-3.5 text-[13px] font-semibold leading-none text-[#0f766e]">
            <CheckCircle />
            Verified
          </span>
        )}

        <button
          type="button"
          onClick={toggleFav}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favourites" : "Add to favourites"}
          className={`absolute right-3.5 top-3.5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white transition duration-200 hover:scale-110 ${
            fav ? "text-red-500" : "text-[#6b6b6b]"
          }`}
        >
          <HeartIcon filled={fav} />
        </button>
      </div>

      {/* details */}
      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 title={name} className="m-0 min-w-0 truncate text-[17px] font-semibold tracking-tight text-[#1c1c1e]">
            {name}
          </h3>
          <span className="shrink-0 whitespace-nowrap font-['Fraunces',Georgia,serif] text-[19px] font-bold text-[#1a6bff]">
            {formatPrice(price)}
          </span>
        </div>

        <p className="mb-4 mt-2 text-sm text-[#8c8c8c]">
          {[year, location].filter(Boolean).join(" · ")}
        </p>

        <ul className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#eeeeee] pt-3 text-xs text-[#8a8a8a]">
          <li className="inline-flex items-center gap-1.5">
            <span className="text-[#7a7a7a]">
              <GaugeIcon />
            </span>
            {formatMileage(mileage)}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="text-[#7a7a7a]">
              {isElectric ? <BoltIcon /> : <FuelIcon />}
            </span>
            {fuelType}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="text-[#7a7a7a]">
              <GearIcon />
            </span>
            {transmission}
          </li>
        </ul>
      </div>
    </article>
  );
}
