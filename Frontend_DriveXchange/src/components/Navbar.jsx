import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

/* route links use <Link>, in-page anchors use <a> */
const NavLink = ({ href, className, onClick, children }) =>
  href.startsWith("/") ? (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );

/* ---------------- avatar + dropdown (logged-in state) ---------------- */
function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click / Escape
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const initial = (user?.name || user?.email || "U")[0].toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#1a6bff] to-[#0b57ef] text-base font-semibold text-white shadow-[0_6px_16px_rgba(26,107,255,0.3)] ring-2 ring-white transition hover:scale-105"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-[#efece6] bg-white shadow-[0_16px_40px_rgba(30,25,15,0.14)]"
        >
          <div className="border-b border-[#efece6] px-4 py-3">
            <p className="text-xs text-[#8c8c8c]">Signed in as</p>
            <p className="truncate text-sm font-semibold text-[#1c1c1e]">{user?.email}</p>
          </div>

          <Link
            to="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-[#1c1c1e] transition-colors hover:bg-[#faf8f4]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
            My Dashboard
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border-t border-[#efece6] px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- navbar ---------------- */
export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleMobileLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#efece6] bg-[#faf8f4]/95 font-['Manrope',system-ui,sans-serif] backdrop-blur">
      <nav className="mx-auto flex h-[100px] max-w-[1320px] items-center justify-between px-4 md:px-8">
        {/* logo */}
        <Link to="/" className="flex items-center gap-3">
          <LogoMark />
          <span className="font-['Fraunces',Georgia,serif] text-2xl font-bold tracking-tight text-[#1c1c1e]">
            Drivexchange
          </span>
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-11 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <NavLink
                href={l.href}
                className="text-[17px] text-[#5f5f5f] transition-colors hover:text-[#1a6bff]"
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* desktop actions: buttons OR profile avatar */}
        <div className="hidden items-center gap-7 md:flex">
          {isLoggedIn ? (
            <ProfileMenu />
          ) : (
            <>
              <Link to="/login" className="text-[17px] font-medium text-[#1c1c1e] hover:text-[#1a6bff]">
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-[#1a6bff] px-6 py-3.5 text-[17px] font-semibold text-white shadow-[0_6px_16px_rgba(26,107,255,0.3)] transition hover:bg-[#0f5ae6]"
              >
                Get Started
              </Link>
            </>
          )}
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
                <NavLink href={l.href} onClick={() => setOpen(false)} className="text-[17px] text-[#5f5f5f]">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center gap-5">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-[#1a6bff] px-5 py-3 font-semibold text-white"
                >
                  My Dashboard
                </Link>
                <button type="button" onClick={handleMobileLogout} className="text-[17px] font-medium text-red-600">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-[17px] font-medium text-[#1c1c1e]">
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-[#1a6bff] px-5 py-3 font-semibold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}