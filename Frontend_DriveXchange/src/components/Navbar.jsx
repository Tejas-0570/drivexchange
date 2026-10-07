import { useState } from "react";

const links = [
  { label: "Browse Cars", href: "/browse-cars" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Sell Your Car", href: "#sell" },
  { label: "About Us", href: "#about" },
];

const LogoMark = () => (
  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1a6bff]">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18L9 6l3 6 3-6 6 12" />
    </svg>
  </span>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#efece6] bg-[#faf8f4]/95 font-['Manrope',system-ui,sans-serif] backdrop-blur">
      <nav className="mx-auto flex h-[100px] max-w-[1320px] items-center justify-between px-4 md:h-[100px] md:px-8">
        {/* logo */}
        <a href="/" className="flex items-center gap-3">
          <LogoMark />
          <span className="font-['Fraunces',Georgia,serif] text-2xl font-bold tracking-tight text-[#1c1c1e]">
            Drivexchange
          </span>
        </a>

        {/* desktop links */}
        <ul className="hidden items-center gap-11 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-[17px] text-[#5f5f5f] transition-colors hover:text-[#1a6bff]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* desktop actions */}
        <div className="hidden items-center gap-7 md:flex">
          <a href="/login" className="text-[17px] font-medium text-[#1c1c1e] hover:text-[#1a6bff]">
            Log In
          </a>
          <a
            href="/signup"
            className="rounded-xl bg-[#1a6bff] px-6 py-3.5 text-[17px] font-semibold text-white shadow-[0_6px_16px_rgba(26,107,255,0.3)] transition hover:bg-[#0f5ae6]"
          >
            Get Started
          </a>
        </div>

        {/* mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-lg text-[#1c1c1e] md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-[#efece6] bg-[#faf8f4] px-4 pb-6 pt-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} onClick={() => setOpen(false)} className="text-[17px] text-[#5f5f5f]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-5">
            <a href="/login" className="text-[17px] font-medium text-[#1c1c1e]">Log In</a>
            <a href="/signup" className="rounded-xl bg-[#1a6bff] px-5 py-3 font-semibold text-white">
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  );
}