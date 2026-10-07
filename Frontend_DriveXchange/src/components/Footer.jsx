const columns = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse Cars", href: "/browse-cars" },
      { label: "Sell Your Car", href: "#sell" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Press", href: "#press" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Security", href: "#security" },
    ],
  },
];

const socials = [
  {
    label: "Website",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
      </>
    ),
  },
  { label: "X", icon: <path d="M5 5l14 14M19 5L5 19" /> },
  {
    label: "LinkedIn",
    icon: (
      <>
        <path d="M6 10v8M6 6.5v.01M10 18v-8M10 13a3 3 0 016 0v5" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#161412] px-4 pb-8 pt-14 font-['Manrope',system-ui,sans-serif] md:px-8">
      <div className="mx-auto max-w-[1144px]">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* brand */}
          <div>
            <a href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1a6bff]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 18L9 6l3 6 3-6 6 12" />
                </svg>
              </span>
              <span className="font-['Fraunces',Georgia,serif] text-lg font-bold text-white">
                Drivexchange
              </span>
            </a>
            <p className="mt-4 max-w-[260px] text-sm leading-6 text-white/55">
              A modern, secure marketplace for discovering, buying, and selling
              vehicles with total confidence.
            </p>

            <div className="mt-5 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-[#1a6bff] hover:text-white"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Drivexchange. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17 9h-1V7a4 4 0 00-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V7z" />
            </svg>
            Secured by 256-bit encryption
          </p>
        </div>
      </div>
    </footer>
  );
}