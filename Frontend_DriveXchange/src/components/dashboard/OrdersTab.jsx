// src/components/dashboard/OrdersTab.jsx
// Dashboard -> "My Orders": every car I booked, and every booking made on my cars.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState, ErrorBanner, Icons, Pill, SectionHeader, Skeleton } from "./ui";
import { formatDateTime, formatPaise } from "./format";
import { statusInfo } from "./orderStatus";
import { getMyTransactions } from "../../api/paymentApi";

export default function OrdersTab() {
  const [orders, setOrders] = useState(null); // null = loading
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | BUYER | SELLER

  const load = useCallback(() => {
    setError("");
    setOrders(null);
    getMyTransactions()
      .then(setOrders)
      .catch((e) => setError(e.message || "Could not load your orders."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = (orders ?? []).filter((o) => filter === "ALL" || o.role === filter);

  return (
    <div>
      <SectionHeader title="My Orders" subtitle="Cars you booked and bookings made on your cars." />

      <div className="mb-5 flex gap-2" role="tablist" aria-label="Filter orders">
        {[
          ["ALL", "All"],
          ["BUYER", "I'm buying"],
          ["SELLER", "I'm selling"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === id
                ? "border-[#1a6bff] bg-[#1a6bff] text-white"
                : "border-[#e6e2da] bg-white text-[#5f5f5f] hover:border-[#1a6bff]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorBanner message={error} onRetry={load} />
      ) : orders === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="No orders yet"
          text="When you reserve a car, or someone reserves yours, it shows up here."
          action={
            <Link to="/browse-cars" className="inline-flex items-center gap-2 rounded-xl bg-[#1a6bff] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f5ae6]">
              Browse cars <Icons.arrow width={16} height={16} />
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {shown.map((o) => {
            const info = statusInfo(o.status);
            return (
              <li key={o.id}>
                <Link to={`/transactions/${o.id}`} className="block">
                  <Card className="flex gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(30,25,15,0.1)]">
                    <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#efece6]">
                      {o.carImage ? (
                        <img src={o.carImage} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-[#c9c5bb]">
                          <Icons.car width={28} height={28} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={info.tone}>{info.label}</Pill>
                        <Pill tone="gray">{o.role === "BUYER" ? "Buying" : "Selling"}</Pill>
                      </div>
                      <p className="mt-1.5 truncate text-[15px] font-semibold text-[#1c1c1e]">{o.carTitle}</p>
                      <p className="mt-0.5 text-xs text-[#8c8c8c]">
                        {o.role === "BUYER" ? "Seller" : "Buyer"}: {o.counterpartName || "—"} ·{" "}
                        {formatDateTime(o.paidAt || o.createdAt)}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="font-['Fraunces',Georgia,serif] text-lg font-bold text-[#1a6bff]">{formatPaise(o.amountPaise)}</p>
                      <p className="text-xs text-[#8c8c8c]">of {formatPaise(o.carPricePaise)}</p>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
