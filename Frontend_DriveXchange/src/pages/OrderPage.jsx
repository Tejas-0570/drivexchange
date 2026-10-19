// src/pages/OrderPage.jsx   (route: /transactions/:id)
// One booking, in detail. This is where the buyer lands after paying, and where either side
// finds the other party's contact details once the booking is paid.
//
// It keeps asking the server while the order is still "Awaiting payment", because the
// server (via Razorpay's webhook) is the one that decides when the payment is final.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Card, ErrorBanner, Icons, Pill, Skeleton } from "../components/dashboard/ui";
import { formatDateTime, formatPaise } from "../components/dashboard/format";
import { PAID_STATUSES, statusInfo } from "../components/dashboard/orderStatus";
import { createOrder, getTransaction, verifyPayment } from "../api/paymentApi";
import useRazorpay from "../hooks/useRazorpay";

const POLL_MS = 3000;
const POLL_AFTER_PAYING_MS = 120_000;

const primary =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0f5ae6] disabled:cursor-not-allowed disabled:opacity-60";

const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-4 py-3 text-sm">
    <span className="text-[#8c8c8c]">{label}</span>
    <span className={strong ? "font-semibold text-[#1c1c1e]" : "text-[#1c1c1e]"}>{value}</span>
  </div>
);

function useCountdown(until) {
  const [left, setLeft] = useState(() => (until ? new Date(until).getTime() - Date.now() : 0));
  useEffect(() => {
    if (!until) return undefined;
    const tick = () => setLeft(new Date(until).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);
  return Math.max(0, left);
}

const mmss = (ms) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function OrderPage() {
  const { id } = useParams();
  const location = useLocation();
  const { logout } = useAuth();
  const { open: openRazorpay } = useRazorpay();

  const justPaid = Boolean(location.state?.justPaid);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payMessage, setPayMessage] = useState("");
  const startedAt = useRef(Date.now());
  // keep the latest logout in a ref so `load` (and the effects that use it) never change identity
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  const load = useCallback(async () => {
    try {
      const data = await getTransaction(id);
      setOrder(data);
      setError("");
      return data;
    } catch (e) {
      if (e.status === 401) logoutRef.current();
      else if (e.status === 404) setNotFound(true);
      else setError(e.message || "Could not load this order.");
      return null;
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, [load]);

  // while the order is "Awaiting payment", ask again every few seconds
  const waiting = order?.status === "CREATED";
  const stillValid = order && new Date(order.expiresAt).getTime() > Date.now();
  useEffect(() => {
    if (!waiting) return undefined;
    const keepGoing = () => stillValid || (justPaid && Date.now() - startedAt.current < POLL_AFTER_PAYING_MS);
    if (!keepGoing()) return undefined;
    const t = setInterval(() => {
      if (!keepGoing()) clearInterval(t);
      else load();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [waiting, stillValid, justPaid, load]);

  const left = useCountdown(waiting ? order?.expiresAt : null);

  /* the buyer left the payment window earlier: pay the SAME order now */
  const resumePayment = async () => {
    setBusy(true);
    setPayMessage("");
    try {
      const o = await createOrder(order.carId); // server hands back the still-open order
      await openRazorpay(o, {
        onSuccess: async (response) => {
          try {
            await verifyPayment(response);
          } catch {
            /* the webhook will finish it; we just reload below */
          }
          await load();
          setBusy(false);
        },
        onFailed: (msg) => {
          setPayMessage(msg);
          setBusy(false);
        },
        onDismiss: () => setBusy(false),
      });
    } catch (e) {
      setPayMessage(e.message || "Could not start the payment.");
      setBusy(false);
    }
  };

  /* ---------------- render ---------------- */
  const shell = (children) => (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      <Navbar />
      <main className="mx-auto max-w-[760px] px-4 py-8 md:py-12">{children}</main>
      <Footer />
    </div>
  );

  if (notFound) {
    return shell(
      <Card className="p-10 text-center">
        <h1 className="font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#1c1c1e]">Order not found</h1>
        <p className="mt-2 text-sm text-[#8c8c8c]">It may not exist, or it belongs to another account.</p>
        <Link to="/dashboard?tab=orders" className={`${primary} mt-6`}>Go to my orders</Link>
      </Card>
    );
  }
  if (error && !order) {
    return shell(<ErrorBanner message={error} onRetry={load} />);
  }
  if (!order) {
    return shell(
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const info = statusInfo(order.status);
  const isBuyer = order.role === "BUYER";
  const paid = PAID_STATUSES.includes(order.status);
  const expired = waiting && left <= 0;
  const confirming = waiting && justPaid && !expired; // paid a moment ago, waiting for the bank's confirmation

  return shell(
    <>
      <Link to="/dashboard?tab=orders" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
        <Icons.arrow width={16} height={16} className="rotate-180" /> My orders
      </Link>

      {/* headline */}
      <Card className="overflow-hidden">
        <div className="flex gap-4 p-5 sm:p-6">
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[#efece6]">
            {order.carImage ? (
              <img src={order.carImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center text-[#c9c5bb]">
                <Icons.car width={28} height={28} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <Pill tone={info.tone}>{confirming ? "Confirming payment…" : info.label}</Pill>
            <h1 className="mt-2 truncate font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#1c1c1e]">{order.carTitle}</h1>
            <Link to={`/cars/${order.carId}`} className="text-xs font-semibold text-[#1a6bff] hover:underline">
              View the listing
            </Link>
          </div>
        </div>

        <div className={`border-t border-[#f1eee8] px-5 py-4 text-sm sm:px-6 ${paid ? "bg-[#e3f1ef] text-[#0f766e]" : "bg-[#faf8f4] text-[#5f5f5f]"}`}>
          {confirming ? (
            <span className="flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d6d2c8] border-t-[#1a6bff]" />
              Payment received. We're waiting for the bank to confirm it. This page updates by itself.
            </span>
          ) : expired ? (
            "The payment window has ended. If money was deducted, it will be refunded automatically."
          ) : (
            (isBuyer ? info.buyer : info.seller)
          )}
        </div>
      </Card>

      {/* pay now (buyer, unpaid, time left) */}
      {waiting && isBuyer && !expired && !confirming && (
        <Card className="mt-5 p-5 sm:p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6b6b6b]">We are holding the car for you for</span>
            <span className="font-mono text-lg font-bold text-[#b45309]">{mmss(left)}</span>
          </div>
          {payMessage && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{payMessage}</p>
          )}
          <button type="button" onClick={resumePayment} disabled={busy} className={`${primary} mt-4`}>
            <Icons.lock width={18} height={18} /> {busy ? "Opening payment…" : `Pay ${formatPaise(order.amountPaise)}`}
          </button>
        </Card>
      )}

      {/* the other party (only after payment; the server sends it only then) */}
      {paid && order.counterpart && (
        <Card className="mt-5 p-5 sm:p-6">
          <h2 className="font-['Fraunces',Georgia,serif] text-lg font-bold text-[#1c1c1e]">
            {isBuyer ? "Seller's contact" : "Buyer's contact"}
          </h2>
          <p className="mt-1 text-xs text-[#8c8c8c]">Use these to arrange the inspection and test drive.</p>
          <div className="mt-4 space-y-3 text-sm">
            <p className="flex items-center gap-3 text-[#1c1c1e]"><Icons.user width={16} height={16} className="text-[#8c8c8c]" /> {order.counterpart.name || "—"}</p>
            {order.counterpart.mobile && (
              <a href={`tel:${order.counterpart.mobile}`} className="flex items-center gap-3 text-[#1a6bff] hover:underline">
                <Icons.phone width={16} height={16} className="text-[#8c8c8c]" /> {order.counterpart.mobile}
              </a>
            )}
            {order.counterpart.email && (
              <a href={`mailto:${order.counterpart.email}`} className="flex items-center gap-3 text-[#1a6bff] hover:underline">
                <Icons.mail width={16} height={16} className="text-[#8c8c8c]" /> {order.counterpart.email}
              </a>
            )}
          </div>
        </Card>
      )}

      {/* the money */}
      <Card className="mt-5 divide-y divide-[#f1eee8] px-5 py-2 sm:px-6">
        <Row label="Car price" value={formatPaise(order.carPricePaise)} />
        <Row label={paid ? "Booking amount paid" : "Booking amount"} value={formatPaise(order.amountPaise)} strong />
        {isBuyer && <Row label="Balance, paid at delivery" value={formatPaise(order.balanceDuePaise)} />}
        {!isBuyer && <Row label="Drivexchange fee (from the booking)" value={formatPaise(order.platformFeePaise)} />}
        <Row label="Booked on" value={formatDateTime(order.createdAt)} />
        {order.paidAt && <Row label="Paid on" value={formatDateTime(order.paidAt)} />}
        <Row label="Order reference" value={<span className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</span>} />
      </Card>

      {/* payment attempts */}
      {order.payments?.length > 0 && (
        <Card className="mt-5 p-5 sm:p-6">
          <h2 className="font-['Fraunces',Georgia,serif] text-lg font-bold text-[#1c1c1e]">Payment attempts</h2>
          <ul className="mt-3 divide-y divide-[#f1eee8]">
            {order.payments.map((p) => (
              <li key={p.razorpayPaymentId} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-[#1c1c1e]">
                    {formatPaise(p.amountPaise)} <span className="text-[#8c8c8c]">· {p.method || "online"}</span>
                  </p>
                  <p className="truncate text-xs text-[#8c8c8c]">
                    {formatDateTime(p.createdAt)}
                    {p.failureReason ? ` · ${p.failureReason}` : ""}
                  </p>
                </div>
                <Pill tone={p.status === "CAPTURED" ? "green" : p.status === "FAILED" ? "amber" : "gray"}>
                  {p.status === "CAPTURED" ? "Paid" : p.status === "FAILED" ? "Failed" : "Refunded"}
                </Pill>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#a8a59e]">
        <Icons.shield width={14} height={14} className="mt-0.5 shrink-0" />
        Never pay a seller outside Drivexchange. Need help? Quote your order reference when you contact us.
      </p>
    </>
  );
}
