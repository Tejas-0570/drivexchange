const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3zm-1.1 12.6l5-5-1.4-1.4-3.6 3.6-1.6-1.6-1.4 1.4 3 3z" />
  </svg>
);

const CheckBadge = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17 9h-1V7a4 4 0 00-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V7z" />
  </svg>
);

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const stats = [
  { value: "42K+", label: "Verified listings" },
  { value: "98%", label: "Buyer satisfaction" },
  { value: "15K+", label: "Secure transactions" },
];

export default function Hero() {
  return (
    <section className="bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-4 py-14 md:px-8 lg:grid-cols-2 lg:py-20">
        {/* left: copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf1ff] px-4 py-2.5 text-[15px] font-medium text-[#1a6bff]">
            <ShieldIcon />
            Verified marketplace, built on trust
          </span>

          <h1 className="mt-8 font-['Fraunces',Georgia,serif] text-5xl font-bold leading-[1.08] tracking-tight text-[#1c1c1e] sm:text-6xl">
            Buy and sell vehicles with total confidence
          </h1>

          <p className="mt-8 max-w-[560px] text-lg leading-8 text-[#6b6b6b]">
            DriveXchange connects verified buyers and sellers through a secure,
            modern platform — complete transactions, payments, and invoices
            without the friction of traditional dealerships.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/browse-cars"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1a6bff] px-9 py-5 text-lg font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:bg-[#0f5ae6]"
            >
              Explore Cars
              <ArrowRight />
            </a>
            <a
              href="#sell"
              className="inline-flex items-center rounded-2xl border border-[#ece8e0] bg-white px-9 py-5 text-lg font-medium text-[#1c1c1e] transition hover:border-[#1a6bff]"
            >
              Sell Your Car
            </a>
          </div>

          <dl className="mt-14 flex flex-wrap items-center gap-y-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`pr-10 ${i > 0 ? "border-l border-[#e6e2da] pl-10" : ""}`}
              >
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-['Fraunces',Georgia,serif] text-[32px] font-bold leading-none text-[#1c1c1e]">
                  {s.value}
                </dd>
                <p className="mt-2 text-base text-[#8c8c8c]">{s.label}</p>
              </div>
            ))}
          </dl>
        </div>

        {/* right: image + floating cards */}
        <div className="relative mx-auto w-full max-w-[720px] lg:ml-auto">
          <div className="aspect-[713/575] overflow-hidden rounded-[36px] bg-gradient-to-br from-[#f1ece3] to-[#e3e7ee] shadow-[0_30px_60px_rgba(30,25,15,0.12)]">
            {/* replace with your own hero image */}
            <img
              src="/src/images/hero-car.png"
              alt="Dark electric sedan in a bright showroom"
              className="h-full w-full object-cover"
            />
          </div>

          {/* verified seller card (top-left) */}
          <div className="absolute -left-4 top-10 flex items-center gap-4 rounded-2xl bg-white py-4 pl-6 pr-8 shadow-[0_12px_32px_rgba(30,25,15,0.12)] sm:-left-10">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e3f1ef] text-[#0f766e]">
              <CheckBadge />
            </span>
            <div>
              <p className="text-base font-semibold text-[#1c1c1e]">Verified Seller</p>
              <p className="text-sm leading-5 text-[#8c8c8c]">
                ID &amp; documents
                <br />
                checked
              </p>
            </div>
          </div>

          {/* transaction card (bottom-right) */}
          <div className="absolute -bottom-6 -right-2 w-[260px] rounded-2xl bg-white px-6 py-5 shadow-[0_12px_32px_rgba(30,25,15,0.14)] sm:-right-4">
            <div className="flex items-center justify-between text-sm text-[#8c8c8c]">
              <span>Transaction</span>
              <span className="text-[#1a6bff]">
                <LockIcon />
              </span>
            </div>
            <p className="mt-3 font-['Fraunces',Georgia,serif] text-[28px] font-bold leading-none text-[#1c1c1e]">
              $28,450
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#0f766e]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 12.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Escrow secured
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}