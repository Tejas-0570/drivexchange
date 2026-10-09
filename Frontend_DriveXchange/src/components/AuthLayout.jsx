import { useState } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/* icons                                                              */
/* ------------------------------------------------------------------ */
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const MailIcon = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3.5 7.5l8.5 6 8.5-6" />
  </svg>
);
export const LockIcon = () => (
  <svg {...base}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);
export const UserIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.2-3.5 4-5 8-5s6.8 1.5 8 5" />
  </svg>
);
export const EyeIcon = () => (
  <svg {...base}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const EyeOffIcon = () => (
  <svg {...base}>
    <path d="M3 3l18 18M10.6 5.2A9.6 9.6 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.6 6.7C3.7 8.6 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 004.2 4.2" />
  </svg>
);

const CheckBadge = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z" />
  </svg>
);

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.100H3.100v2.600A10 10 0 0012 22z" />
    <path fill="#FBBC05" d="M6.400 13.900a6 6 0 010-3.800V7.500H3.100a10 10 0 000 9l3.300-2.600z" />
    <path fill="#EA4335" d="M12 6c1.500 0 2.800.5 3.800 1.500l2.900-2.900A10 10 0 003.100 7.500l3.300 2.600C7.200 7.800 9.400 6 12 6z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* small shared form pieces                                           */
/* ------------------------------------------------------------------ */
export function Field({ id, label, icon, error, right, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#1c1c1e]">
        {label}
      </label>
      <div
        className={`group flex items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:border-[#1a6bff] focus-within:shadow-[0_0_0_4px_rgba(26,107,255,0.12)] ${
          error ? "border-red-400" : "border-[#e6e2da]"
        }`}
      >
        <span className="text-[#9a9a9a] transition-colors group-focus-within:text-[#1a6bff]">
          {icon}
        </span>
        <input
          id={id}
          {...inputProps}
          className="w-full bg-transparent py-3.5 text-[15px] text-[#1c1c1e] outline-none placeholder:text-[#b3b0a9]"
        />
        {right}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function PasswordField(props) {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      type={show ? "text" : "password"}
      icon={<LockIcon />}
      right={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-[#9a9a9a] transition-colors hover:text-[#1a6bff]"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}

export function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
          <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function GoogleButton({ children }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#e6e2da] bg-white py-3.5 text-[15px] font-medium text-[#1c1c1e] transition hover:-translate-y-0.5 hover:border-[#1a6bff]"
    >
      <GoogleG />
      {children}
    </button>
  );
}

export const OrDivider = () => (
  <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-[#a8a59e]">
    <span className="h-px flex-1 bg-[#e6e2da]" />
    or
    <span className="h-px flex-1 bg-[#e6e2da]" />
  </div>
);

/* staggered fade-up wrapper */
export const Reveal = ({ delay = 0, className = "", children }) => (
  <div className={`auth-fade ${className}`} style={{ animationDelay: `${delay}ms` }}>
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* the layout                                                         */
/* ------------------------------------------------------------------ */
const stats = [
  { value: "42K+", label: "Verified listings" },
  { value: "98%", label: "Buyer satisfaction" },
  { value: "15K+", label: "Secure transactions" },
];

export default function AuthLayout({ panelTitle, panelText, children }) {
  return (
    <div className="grid min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif] lg:grid-cols-2 lg:p-4">
      {/* keyframes live here so no external .css file is needed */}
      <style>{`
        @keyframes authFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes authFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes authGlow { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .85; transform: scale(1.08); } }
        .auth-fade { animation: authFadeUp .65s cubic-bezier(.22,.61,.36,1) both; }
        .auth-float { animation: authFloat 6s ease-in-out infinite; }
        .auth-glow { animation: authGlow 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .auth-fade, .auth-float, .auth-glow { animation: none; } }
      `}</style>

      {/* ---------- form side ---------- */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex w-fit items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1a6bff]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 18L9 6l3 6 3-6 6 12" />
            </svg>
          </span>
          <span className="font-['Fraunces',Georgia,serif] text-2xl font-bold tracking-tight text-[#1c1c1e]">
            Drivexchange
          </span>
        </Link>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          {children}
        </div>

        <p className="text-center text-xs text-[#a8a59e]">
          © {new Date().getFullYear()} Drivexchange · Secured by 256-bit encryption
        </p>
      </div>

      {/* ---------- visual side ---------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden rounded-[28px] bg-[#161412] p-12 text-white lg:flex">
        <div aria-hidden="true" className="auth-glow pointer-events-none absolute -right-28 -top-28 h-[440px] w-[440px] rounded-full bg-[#1a4fd6]/40 blur-3xl" />
        <div aria-hidden="true" className="auth-glow pointer-events-none absolute -bottom-32 -left-24 h-[360px] w-[360px] rounded-full bg-[#1a6bff]/20 blur-3xl" style={{ animationDelay: "2s" }} />

        <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82ff" aria-hidden="true">
            <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3z" />
          </svg>
          Verified marketplace, built on trust
        </span>

        <div className="relative">
          <h2 className="max-w-[460px] font-['Fraunces',Georgia,serif] text-4xl font-bold leading-tight tracking-tight">
            {panelTitle}
          </h2>
          <p className="mt-4 max-w-[420px] text-[15px] leading-7 text-white/60">{panelText}</p>

          {/* floating cards */}
          <div className="relative mt-10 h-[250px]">
            <div className="auth-float absolute left-0 top-0 flex items-center gap-4 rounded-2xl bg-white py-4 pl-5 pr-7 text-[#1c1c1e] shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e3f1ef] text-[#0f766e]">
                <CheckBadge />
              </span>
              <div>
                <p className="text-sm font-semibold">Verified Seller</p>
                <p className="text-xs leading-4 text-[#8c8c8c]">ID &amp; documents checked</p>
              </div>
            </div>

            <div className="auth-float absolute right-0 top-20 w-[230px] rounded-2xl bg-white px-5 py-4 text-[#1c1c1e] shadow-[0_16px_36px_rgba(0,0,0,0.35)]" style={{ animationDelay: "1.4s" }}>
              <div className="flex items-center justify-between text-xs text-[#8c8c8c]">
                Transaction
                <span className="text-[#1a6bff]"><LockIcon /></span>
              </div>
              <p className="mt-2 font-['Fraunces',Georgia,serif] text-2xl font-bold leading-none">$28,450</p>
              <p className="mt-2 text-xs font-medium text-[#0f766e]">✓ Escrow secured</p>
            </div>

            <div className="auth-float absolute bottom-0 left-10 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur" style={{ animationDelay: "2.6s" }}>
              <p className="font-['Fraunces',Georgia,serif] text-2xl font-bold leading-none">4.9/5</p>
              <p className="mt-1.5 text-[11px] leading-4 text-white/60">Average seller rating</p>
            </div>
          </div>
        </div>

        <dl className="relative flex gap-10 border-t border-white/10 pt-6">
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="font-['Fraunces',Georgia,serif] text-2xl font-bold leading-none">{s.value}</dd>
              <dt className="mt-1.5 text-xs text-white/50">{s.label}</dt>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}