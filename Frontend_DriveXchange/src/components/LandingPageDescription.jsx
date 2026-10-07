import { Link } from "react-router-dom";
const IconWrap = ({ children }) => (
  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e8f0ff] text-[#1a6bff]">
    {children}
  </span>
);

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const features = [
  {
    title: "Identity-verified network",
    text: "Every buyer and seller is verified before transacting on the platform.",
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M6.5 16c.6-1.4 1.6-2 2.5-2s1.9.6 2.5 2M14 10h4M14 13h3" />
      </svg>
    ),
  },
  {
    title: "Full vehicle transparency",
    text: "Inspection reports and history records available for every listing.",
    icon: (
      <svg {...svgProps}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Dedicated support",
    text: "Real humans guiding you through every transaction, start to finish.",
    icon: (
      <svg {...svgProps}>
        <path d="M4 14v-2a8 8 0 0116 0v2" />
        <rect x="3" y="14" width="4" height="6" rx="1.5" />
        <rect x="17" y="14" width="4" height="6" rx="1.5" />
      </svg>
    ),
  },
];

const perks = [
  "Free listing creation in minutes",
  "Secure, escrow-backed payments",
  "Automatic digital invoices & transfer paperwork",
  "Access to a nationwide buyer network",
];
 
const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

 
const features2 = [
  {
    title: "Escrow Protection",
    text: "Funds released only on confirmation",
    icon: (
      <svg {...svgProps}>
        <path d="M12 3l8 3v6c0 4.6-3.2 8.2-8 9-4.8-.8-8-4.4-8-9V6l8-3z" />
      </svg>
    ),
  },
  {
    title: "Instant Invoicing",
    text: "Auto-generated, downloadable records",
    icon: (
      <svg {...svgProps}>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h7M9 17h5" />
      </svg>
    ),
  },
  {
    title: "Encrypted Payments",
    text: "256-bit secure payment gateway",
    icon: (
      <svg {...svgProps}>
        <circle cx="8" cy="15" r="4" />
        <path d="M11 12l9-9M16 7l3 3M14 9l2 2" />
      </svg>
    ),
  },
  {
    title: "Dispute Resolution",
    text: "Dedicated support for every case",
    icon: (
      <svg {...svgProps}>
        <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
      </svg>
    ),
  },
];

const rows = [
  { label: "Vehicle price", value: "$28,250.00" },
  { label: "Platform fee", value: "$199.00" },
  { label: "Escrow protection", value: "Included" },
];

const stats = [
  { value: "4", label: "Saved cars", color: "text-[#1c1c1e]" },
  { value: "1", label: "In escrow", color: "text-[#b45309]" },
  { value: "2", label: "Invoices", color: "text-[#1a6bff]" },
];
 
const activity = [
  {
    title: "Honda CR-V 2022",
    sub: "Offer sent · Awaiting response",
    status: "Pending",
    pill: "bg-[#e8f0ff] text-[#1a6bff]",
    tile: "bg-[#e8f0ff] text-[#1a6bff]",
    icon: (
      <path d="M5 16l1.5-5A2 2 0 018.4 9.5h7.2a2 2 0 011.9 1.5L19 16M4 16h16v3h-2.5v-1.5h-11V19H4v-3zm3.5-2.5h.01M16.5 13.5h.01" />
    ),
  },
  {
    title: "Mazda CX-5 Invoice",
    sub: "Generated · Ready to download",
    status: "Done",
    pill: "bg-[#e3f1ef] text-[#0f766e]",
    tile: "bg-[#e3f1ef] text-[#0f766e]",
    icon: <path d="M7 3h7l4 4v14H7zM14 3v5h4M10 13h5M10 17h4" />,
  },
];
export default function LandingPageDescription() {
  return (
    <>
    <section className="bg-[#faf8f4] px-4 py-16 font-['Manrope',system-ui,sans-serif] md:px-8 md:py-20">
      <div className="mx-auto grid max-w-[1144px] items-center gap-12 lg:grid-cols-2">
        {/* copy */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6bff]">
            Why DriveXchange
          </p>
          <h2 className="mt-3 max-w-[460px] font-['Fraunces',Georgia,serif] text-3xl font-bold leading-tight tracking-tight text-[#1c1c1e] sm:text-4xl">
            A marketplace engineered for peace of mind
          </h2>
          <p className="mt-4 max-w-[470px] text-[15px] leading-7 text-[#8c8c8c]">
            We've rebuilt the vehicle buying experience from the ground up —
            removing uncertainty and replacing it with transparency, at every
            step.
          </p>

          <ul className="mt-8 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <IconWrap>{f.icon}</IconWrap>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1c1c1e]">
                    {f.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-[#8c8c8c]">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* image */}
        <div className="aspect-[4/3] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f1ece3] to-[#e3e7ee] shadow-[0_20px_44px_rgba(30,25,15,0.12)]">
          <img
            src="/src/images/Vehicle-Inspection.png"
            alt="Inspecting a vehicle report on a tablet"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
    <section
      id="sell"
      className="border-y border-[#efece6] bg-[#fdfcfa] px-4 py-16 font-['Manrope',system-ui,sans-serif] md:px-8 md:py-20"
    >
      <div className="mx-auto grid max-w-[1144px] items-center gap-12 lg:grid-cols-2">
        {/* image + rating card */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f1ece3] to-[#e3e7ee] shadow-[0_20px_44px_rgba(30,25,15,0.12)]">
            <img
              src="/src/images/Seller-Handshake.png"
              alt="Seller handing over car keys to a buyer"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
 
          <div className="absolute -bottom-5 right-4 rounded-2xl bg-[#161412] px-5 py-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.25)] sm:-right-4">
            <p className="font-['Fraunces',Georgia,serif] text-2xl font-bold leading-none">
              4.9/5
            </p>
            <p className="mt-1.5 text-[11px] leading-4 text-white/60">
              Average seller rating across
              <br />
              12K+ listings
            </p>
          </div>
        </div>
 
        {/* copy */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6bff]">
            For Sellers
          </p>
          <h2 className="mt-3 font-['Fraunces',Georgia,serif] text-3xl font-bold leading-tight tracking-tight text-[#1c1c1e] sm:text-4xl">
            List your vehicle with confidence
          </h2>
          <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[#8c8c8c]">
            Reach thousands of verified buyers, manage offers in one place, and
            get paid securely — all without the hassle of traditional
            classifieds.
          </p>
 
          <ul className="mt-6 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-[#3d3d3d]">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e3f1ef] text-[#0f766e]">
                  <CheckIcon />
                </span>
                {p}
              </li>
            ))}
          </ul>
 
          <Link
            to="/sell"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#161412] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#2a2622]"
          >
            Start Selling
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>

    <section className="bg-[#faf8f4] px-4 py-16 font-['Manrope',system-ui,sans-serif] md:px-8 md:py-20">
      <div className="relative mx-auto max-w-[1144px] overflow-hidden rounded-[28px] bg-[#161412] px-6 py-12 sm:px-12 sm:py-14">
        {/* soft blue glow, top-right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#1a4fd6]/30 blur-3xl"
        />
 
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          {/* copy */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3b82ff]">
              Bank-grade protection
            </p>
            <h2 className="mt-3 max-w-[420px] font-['Fraunces',Georgia,serif] text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Every transaction, fully protected
            </h2>
            <p className="mt-4 max-w-[430px] text-[15px] leading-7 text-white/60">
              Funds are held securely in escrow until both parties confirm the
              transaction, with full documentation generated automatically.
            </p>
 
            <ul className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {features2.map((f) => (
                <li key={f.title}>
                  <span className="text-[#3b82ff]">{f.icon}</span>
                  <h3 className="mt-3 text-[15px] font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/55">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
 
          {/* transaction summary card */}
          <div className="w-full max-w-[440px] justify-self-center rounded-2xl bg-white p-6 shadow-[0_20px_44px_rgba(0,0,0,0.35)] lg:justify-self-end">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#1c1c1e]">
                Transaction Summary
              </h3>
              <span className="rounded-full bg-[#e3f1ef] px-3 py-1 text-xs font-medium text-[#0f766e]">
                Secured
              </span>
            </div>
 
            <dl className="mt-5 space-y-3 text-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <dt className="text-[#8c8c8c]">{r.label}</dt>
                  <dd className="font-medium text-[#1c1c1e]">{r.value}</dd>
                </div>
              ))}
            </dl>
 
            <div className="mt-5 flex items-center justify-between border-t border-[#eeeeee] pt-5">
              <span className="text-[15px] font-semibold text-[#1c1c1e]">Total</span>
              <span className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1a6bff]">
                $28,449.00
              </span>
            </div>
 
            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.35)] transition hover:bg-[#0f5ae6]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17 9h-1V7a4 4 0 00-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V7z" />
              </svg>
              Confirm &amp; Pay Securely
            </button>
          </div>
        </div>
      </div>
    </section>
    <section className="bg-white px-4 py-16 font-['Manrope',system-ui,sans-serif] md:px-8 md:py-20">
      <div className="mx-auto grid max-w-[1144px] items-center gap-12 lg:grid-cols-2">
        {/* copy */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6bff]">
            Your Dashboard
          </p>
          <h2 className="mt-3 max-w-[420px] font-['Fraunces',Georgia,serif] text-3xl font-bold leading-tight tracking-tight text-[#1c1c1e] sm:text-4xl">
            A personalized experience, built around you
          </h2>
          <p className="mt-4 max-w-[430px] text-[15px] leading-7 text-[#8c8c8c]">
            Track saved vehicles, ongoing conversations, transaction status,
            and invoices — all from a single, elegant dashboard.
          </p>
          <Link
            to="/signup"
            className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1a6bff] hover:text-[#0f5ae6]"
          >
            Create your free account
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
 
        {/* dashboard mock */}
        <div className="w-full max-w-[460px] justify-self-center rounded-2xl border border-[#efece6] bg-[#faf8f4] p-5 shadow-[0_20px_44px_rgba(30,25,15,0.1)] lg:justify-self-end">
          {/* header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d9cdbd] text-sm font-semibold text-[#5b4a36]">
                T
              </span>
              <div>
                <p className="text-sm font-semibold text-[#1c1c1e]">
                  Welcome back, Tejas
                </p>
                <p className="text-xs text-[#8c8c8c]">3 active conversations</p>
              </div>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8c8c8c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="Notifications"
            >
              <path d="M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 004 0" />
            </svg>
          </div>
 
          {/* stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-[#efece6] bg-white py-3 text-center"
              >
                <p className={`font-['Fraunces',Georgia,serif] text-xl font-bold ${s.color}`}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-[#8c8c8c]">{s.label}</p>
              </div>
            ))}
          </div>
 
          {/* activity */}
          <ul className="mt-4 space-y-3">
            {activity.map((a) => (
              <li
                key={a.title}
                className="flex items-center gap-3 rounded-xl border border-[#efece6] bg-white p-3"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${a.tile}`}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {a.icon}
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1c1c1e]">
                    {a.title}
                  </p>
                  <p className="truncate text-xs text-[#8c8c8c]">{a.sub}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${a.pill}`}>
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
    <section className="bg-[#faf8f4] px-4 py-16 font-['Manrope',system-ui,sans-serif] md:px-8 md:py-20">
      <div className="mx-auto max-w-[1144px] rounded-[28px] bg-gradient-to-br from-[#1a6bff] via-[#1262f5] to-[#0b57ef] px-6 py-14 text-center shadow-[0_24px_50px_rgba(26,107,255,0.28)] sm:px-12 sm:py-16">
        <h2 className="mx-auto max-w-[520px] font-['Fraunces',Georgia,serif] text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Ready to find your next vehicle — or your next buyer?
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-white/85">
          Join thousands using DriveXchange to buy and sell with complete
          confidence.
        </p>
 
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/signup"
            className="rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-[#1c1c1e] transition hover:bg-[#f1f5ff]"
          >
            Create Account
          </Link>
          <Link
            to="/browse-cars"
            className="rounded-xl border border-white/50 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10"
          >
            Explore Cars
          </Link>
        </div>
      </div>
    </section>
    </> 
  );
}