// src/components/admin/adminUi.jsx
// Small building blocks shared by every admin screen (tables, tabs, search, modals, status pills).
// Styling is Tailwind only, same colours as the rest of Drivexchange.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState, ErrorBanner, Icons, Modal, Skeleton } from "../dashboard/ui";

/* ------------------------------------------------------------------ status pills ------------- */
const TONES = {
  blue: "bg-[#e8f0ff] text-[#1a6bff]",
  green: "bg-[#e3f1ef] text-[#0f766e]",
  amber: "bg-[#fdf1dc] text-[#b45309]",
  gray: "bg-[#efece6] text-[#6b6b6b]",
  red: "bg-[#fde8e8] text-[#c53030]",
};

export const AdminPill = ({ tone = "gray", children }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONES[tone] ?? TONES.gray}`}>
    {children}
  </span>
);

const make = (map) => (value) => {
  const key = String(value ?? "").toUpperCase();
  const m = map[key] ?? { label: value || "—", tone: "gray" };
  return <AdminPill tone={m.tone}>{m.label}</AdminPill>;
};

export const APPROVAL = {
  PENDING: { label: "Pending review", tone: "amber" },
  APPROVED: { label: "Approved", tone: "green" },
  REJECTED: { label: "Rejected", tone: "red" },
};
export const AVAILABILITY = {
  AVAILABLE: { label: "Available", tone: "green" },
  RESERVED: { label: "Reserved", tone: "blue" },
  SOLD: { label: "Sold", tone: "gray" },
  INACTIVE: { label: "Inactive", tone: "gray" },
};
export const USER_STATUS = {
  ACTIVE: { label: "Active", tone: "green" },
  SUSPENDED: { label: "Suspended", tone: "red" },
};
export const ORDER_STATUS = {
  CREATED: { label: "Unpaid", tone: "gray" },
  PAID_HELD: { label: "Paid · awaiting delivery", tone: "blue" },
  DELIVERED: { label: "Delivered · awaiting payout", tone: "amber" },
  RELEASED: { label: "Completed", tone: "green" },
  DISPUTED: { label: "Disputed", tone: "red" },
  REFUNDED: { label: "Refunded", tone: "gray" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
  EXPIRED: { label: "Expired", tone: "gray" },
};
export const PAYMENT_STATUS = {
  CAPTURED: { label: "Paid", tone: "green" },
  FAILED: { label: "Failed", tone: "red" },
  REFUNDED: { label: "Refunded", tone: "gray" },
};

export const approvalPill = make(APPROVAL);
export const availabilityPill = make(AVAILABILITY);
export const userStatusPill = make(USER_STATUS);
export const orderStatusPill = make(ORDER_STATUS);
export const paymentStatusPill = make(PAYMENT_STATUS);

/* ------------------------------------------------------------------ page header --------------- */
export function PageHeader({ title, subtitle, back, action }) {
  return (
    <div className="mb-6">
      {back && (
        <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
          <Icons.arrow width={16} height={16} className="rotate-180" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-['Fraunces',Georgia,serif] text-3xl font-bold tracking-tight text-[#1c1c1e]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[15px] text-[#8c8c8c]">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ tabs & search ------------- */
export function Tabs({ items, value, onChange, label = "Filter" }) {
  return (
    <div role="tablist" aria-label={label} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {items.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-[#1a6bff] bg-[#1a6bff] text-white shadow-[0_6px_16px_rgba(26,107,255,0.25)]"
                : "border-[#e6e2da] bg-white text-[#5f5f5f] hover:border-[#1a6bff] hover:text-[#1a6bff]"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[11px] ${active ? "bg-white/25 text-white" : "bg-[#fdf1dc] text-[#b45309]"}`}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// types in the box, tells the page only after a short pause (so we don't call the server on every key)
export function SearchBox({ value, onChange, placeholder = "Search…" }) {
  const [text, setText] = useState(value);
  const last = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange; // always call the newest handler, without restarting the timer

  // the URL changed from outside (back button, tab click): follow it
  useEffect(() => {
    if (value !== last.current) {
      last.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (text === last.current) return undefined;
    const t = setTimeout(() => {
      last.current = text;
      onChangeRef.current(text.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <label className="relative block w-full sm:max-w-[320px]">
      <span className="sr-only">{placeholder}</span>
      <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a59e]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e6e2da] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1c1c1e] outline-none transition focus:border-[#1a6bff] focus:ring-2 focus:ring-[#1a6bff]/20"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ table -------------------- */
// columns: [{ key, label, render?(row), className? }]
export function DataTable({ columns, rows, loading, error, onRetry, onRowClick, rowKey = "id", emptyTitle, emptyText }) {
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />;

  if (loading && !rows) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (rows && rows.length === 0) {
    return <EmptyState icon="overview" title={emptyTitle || "Nothing here"} text={emptyText || "No results match your filters."} />;
  }

  return (
    <Card className={`overflow-hidden transition-opacity ${loading ? "opacity-60" : ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#efece6] bg-[#faf8f4] text-xs font-semibold uppercase tracking-wide text-[#8c8c8c]">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`px-4 py-3 ${c.className || ""}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1eee8]">
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer transition hover:bg-[#faf8f4] focus:bg-[#faf8f4] focus:outline-none" : ""}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3.5 align-middle text-[#1c1c1e] ${c.className || ""}`}>
                    {c.render ? c.render(row) : row[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Pagination({ data, onPage }) {
  if (!data || data.totalPages <= 1) {
    return data && data.totalElements > 0 ? (
      <p className="mt-4 text-sm text-[#8c8c8c]">{data.totalElements} result{data.totalElements === 1 ? "" : "s"}</p>
    ) : null;
  }
  const from = data.page * data.size + 1;
  const to = Math.min(data.totalElements, (data.page + 1) * data.size);
  const btn =
    "rounded-xl border border-[#e6e2da] bg-white px-4 py-2 text-sm font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff] hover:text-[#1a6bff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#e6e2da] disabled:hover:text-[#1c1c1e]";
  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-sm text-[#8c8c8c]">
        Showing {from}–{to} of {data.totalElements}
      </p>
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={data.page <= 0} onClick={() => onPage(data.page - 1)}>
          Previous
        </button>
        <button type="button" className={btn} disabled={data.page >= data.totalPages - 1} onClick={() => onPage(data.page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ detail blocks ------------ */
export const Section = ({ title, children, action }) => (
  <Card className="p-5 sm:p-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-['Fraunces',Georgia,serif] text-lg font-bold text-[#1c1c1e]">{title}</h2>
      {action}
    </div>
    {children}
  </Card>
);

export const FieldGrid = ({ items }) => (
  <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <div key={label} className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-[#a8a59e]">{label}</dt>
        <dd className="mt-1 break-words text-sm text-[#1c1c1e]">{value ?? "—"}</dd>
      </div>
    ))}
  </dl>
);

export const MoneyRow = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-[#8c8c8c]">{label}</span>
    <span className={strong ? "font-semibold text-[#1c1c1e]" : "text-[#1c1c1e]"}>{value}</span>
  </div>
);

// who did what, newest first. items: [{ at, title, text }]
export function Timeline({ items }) {
  if (!items?.length) return <p className="text-sm text-[#8c8c8c]">Nothing recorded yet.</p>;
  return (
    <ol className="space-y-4 border-l border-[#efece6] pl-5">
      {items.map((it, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#1a6bff] ring-4 ring-white" />
          <p className="text-sm font-semibold text-[#1c1c1e]">{it.title}</p>
          {it.text && <p className="mt-0.5 text-sm text-[#5f5f5f]">{it.text}</p>}
          <p className="mt-0.5 text-xs text-[#a8a59e]">{it.at}</p>
        </li>
      ))}
    </ol>
  );
}

export const StatCard = ({ label, value, hint, to, tone = "default" }) => {
  const body = (
    <Card className={`h-full p-5 transition ${to ? "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(30,25,15,0.1)]" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#a8a59e]">{label}</p>
      <p className={`mt-2 font-['Fraunces',Georgia,serif] text-3xl font-bold ${tone === "alert" ? "text-[#b45309]" : "text-[#1c1c1e]"}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-[#8c8c8c]">{hint}</p>}
    </Card>
  );
  return to ? (
    <Link to={to} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
};

/* ------------------------------------------------------------------ buttons ------------------ */
export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a6bff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6] disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#c53030] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9b2424] disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e6e2da] bg-white px-5 py-3 text-sm font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff] hover:text-[#1a6bff] disabled:cursor-not-allowed disabled:opacity-60",
  ghostDanger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#f3c4c4] bg-white px-5 py-3 text-sm font-semibold text-[#c53030] transition hover:bg-[#fde8e8] disabled:cursor-not-allowed disabled:opacity-60",
};

/* ------------------------------------------------------------------ modals ------------------- */
// Asks for a written reason (or a short text such as a payout reference) before a serious action.
// onSubmit(text) must return a promise that resolves to true when it worked (the modal then closes).
export function ReasonModal({
  title,
  subtitle,
  label = "Reason",
  placeholder = "Explain why…",
  confirmLabel = "Confirm",
  tone = "danger",
  minLength = 5,
  multiline = true,
  onSubmit,
  onClose,
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = text.trim().length >= minLength;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    const ok = await onSubmit(text.trim());
    if (ok) onClose();
    else setBusy(false);
  };

  const fieldClass =
    "w-full rounded-xl border border-[#e6e2da] bg-white px-4 py-3 text-sm text-[#1c1c1e] outline-none transition focus:border-[#1a6bff] focus:ring-2 focus:ring-[#1a6bff]/20";

  return (
    <Modal title={title} subtitle={subtitle} onClose={() => !busy && onClose()}>
      <form onSubmit={submit}>
        <label className="block text-sm font-semibold text-[#1c1c1e]" htmlFor="admin-reason">
          {label}
        </label>
        {multiline ? (
          <textarea id="admin-reason" rows={4} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className={`${fieldClass} mt-2 resize-none`} />
        ) : (
          <input id="admin-reason" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className={`${fieldClass} mt-2`} />
        )}
        <p className="mt-1.5 text-xs text-[#a8a59e]">At least {minLength} characters. This is saved in the activity log.</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} disabled={busy} className={`${btn.ghost} flex-1`}>
            Cancel
          </button>
          <button type="submit" disabled={!valid || busy} className={`${tone === "danger" ? btn.danger : btn.primary} flex-1`}>
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ConfirmModal({ title, subtitle, text, confirmLabel = "Confirm", tone = "primary", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    const ok = await onConfirm();
    if (ok) onClose();
    else setBusy(false);
  };
  return (
    <Modal title={title} subtitle={subtitle} onClose={() => !busy && onClose()}>
      {text && <p className="text-sm leading-6 text-[#5f5f5f]">{text}</p>}
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} disabled={busy} className={`${btn.ghost} flex-1`}>
          Cancel
        </button>
        <button type="button" onClick={go} disabled={busy} className={`${tone === "danger" ? btn.danger : btn.primary} flex-1`}>
          {busy ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ run an admin action ------ */
// run(() => approveListing(id), "Listing approved")  -> true / false
// shows a toast, and on success calls afterSuccess() (reload the page + the sidebar counts)
export function makeActionRunner(notify, afterSuccess) {
  return async (fn, successMessage) => {
    try {
      await fn();
      notify(successMessage);
      afterSuccess?.();
      return true;
    } catch (e) {
      const msg =
        e?.status === 403
          ? "You are not allowed to do this."
          : e?.status === 409 || e?.status === 400
          ? e.message || "This action is not possible right now."
          : e?.message || "Something went wrong. Please try again.";
      notify(msg, "error");
      return false;
    }
  };
}
