// src/components/dashboard/ui.jsx
// Small shared building blocks for the dashboard.
import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------------------- icons ---------------------------- */
const ic = {
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

export const Icons = {
  overview: (p) => (
    <svg {...ic} {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  user: (p) => (
    <svg {...ic} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.2-3.5 4-5 8-5s6.8 1.5 8 5" />
    </svg>
  ),
  car: (p) => (
    <svg {...ic} {...p}>
      <path d="M5 16l1.5-5A2 2 0 018.4 9.5h7.2a2 2 0 011.9 1.5L19 16M4 16h16v3h-2.5v-1.5h-11V19H4v-3z" />
      <path d="M7.5 13h.01M16.5 13h.01" />
    </svg>
  ),
  heart: (p) => (
    <svg {...ic} {...p}>
      <path d="M12 20.5s-7.5-4.7-9.3-9.2C1.5 8.2 3.3 5 6.6 5c2 0 3.5 1.1 5.4 3.2C13.9 6.1 15.4 5 17.4 5c3.3 0 5.1 3.2 3.9 6.3-1.8 4.5-9.3 9.2-9.3 9.2z" />
    </svg>
  ),
  shield: (p) => (
    <svg {...ic} {...p}>
      <path d="M12 3l8 3v6c0 4.6-3.2 8.2-8 9-4.8-.8-8-4.4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  lock: (p) => (
    <svg {...ic} {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  ),
  mail: (p) => (
    <svg {...ic} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7.5l8.5 6 8.5-6" />
    </svg>
  ),
  phone: (p) => (
    <svg {...ic} {...p}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </svg>
  ),
  pin: (p) => (
    <svg {...ic} {...p}>
      <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  plus: (p) => (
    <svg {...ic} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  check: (p) => (
    <svg {...ic} strokeWidth={3} {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  alert: (p) => (
    <svg {...ic} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </svg>
  ),
  arrow: (p) => (
    <svg {...ic} strokeWidth={2.2} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  logout: (p) => (
    <svg {...ic} {...p}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  close: (p) => (
    <svg {...ic} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
};

/* ---------------------------- layout bits ---------------------------- */
export const Card = ({ className = "", children, ...rest }) => (
  <div
    {...rest}
    className={`rounded-2xl border border-[#efece6] bg-white shadow-[0_2px_10px_rgba(30,25,15,0.05)] ${className}`}
  >
    {children}
  </div>
);

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="font-['Fraunces',Georgia,serif] text-3xl font-bold tracking-tight text-[#1c1c1e]">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-[15px] text-[#8c8c8c]">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-[#ece8e0] ${className}`} />
);

export const EmptyState = ({ icon, title, text, action }) => {
  const Icon = Icons[icon] ?? Icons.car;
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f0ff] text-[#1a6bff]">
        <Icon width={26} height={26} />
      </span>
      <h3 className="mt-5 font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">
        {title}
      </h3>
      <p className="mt-2 max-w-[360px] text-sm leading-6 text-[#8c8c8c]">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
};

export const ErrorBanner = ({ message, onRetry }) => (
  <div
    role="alert"
    className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
  >
    <span className="flex items-center gap-2">
      <Icons.alert />
      {message}
    </span>
    {onRetry && (
      <button type="button" onClick={onRetry} className="shrink-0 font-semibold underline">
        Retry
      </button>
    )}
  </div>
);

export const Pill = ({ tone = "blue", children }) => {
  const tones = {
    blue: "bg-[#e8f0ff] text-[#1a6bff]",
    green: "bg-[#e3f1ef] text-[#0f766e]",
    amber: "bg-[#fdf1dc] text-[#b45309]",
    gray: "bg-[#efece6] text-[#6b6b6b]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};

/* ---------------------------- modal ---------------------------- */
export function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="dash-fade fixed inset-0 z-[70] grid place-items-center bg-[#161412]/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="dash-pop w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)] sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#1c1c1e]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-[#8c8c8c]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-[#8c8c8c] transition hover:bg-[#faf8f4] hover:text-[#1c1c1e]">
            <Icons.close />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------- toast ---------------------------- */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const notify = useCallback((message, type = "success") => {
    clearTimeout(timer.current);
    setToast({ message, type, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const toastNode = toast && (
    <div
      key={toast.id}
      role="status"
      className={`dash-pop fixed bottom-6 right-4 z-[80] flex max-w-[360px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] sm:right-6 ${
        toast.type === "error" ? "bg-red-600" : "bg-[#161412]"
      }`}
    >
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${toast.type === "error" ? "bg-white/20" : "bg-[#0f9d8a]"}`}>
        {toast.type === "error" ? <Icons.alert width={14} height={14} /> : <Icons.check width={12} height={12} />}
      </span>
      {toast.message}
    </div>
  );

  return { toastNode, notify };
}