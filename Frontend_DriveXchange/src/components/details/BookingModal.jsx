// src/components/details/BookingModal.jsx
// Confirm screen + progress for the booking payment. All logic lives in useReserveCar.
import { Link } from "react-router-dom";
import { Icons, Modal, Skeleton } from "../dashboard/ui";
import { formatDateTime, formatPaise } from "../dashboard/format";
import useReserveCar from "../../hooks/useReserveCar";

const primary =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0f5ae6] disabled:cursor-not-allowed disabled:opacity-60";
const secondary =
  "flex w-full items-center justify-center rounded-xl border border-[#e6e2da] bg-white py-3 text-sm font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff] hover:text-[#1a6bff]";

const Row = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
    <span className="text-[#8c8c8c]">{label}</span>
    <span className={strong ? "font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1a6bff]" : "font-medium text-[#1c1c1e]"}>
      {value}
    </span>
  </div>
);

const Spinner = ({ text }) => (
  <div className="flex flex-col items-center gap-4 py-8 text-center" role="status">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#e8f0ff] border-t-[#1a6bff]" />
    <p className="text-sm text-[#5f5f5f]">{text}</p>
  </div>
);

export default function BookingModal({ car, onClose }) {
  const { phase, quote, order, message, pay, release, retryQuote } = useReserveCar(car.id);

  // while money is moving, don't let a stray click close the window
  const busy = ["creating", "paying", "verifying"].includes(phase);
  const close = () => !busy && onClose();

  return (
    <Modal title="Reserve this car" subtitle={car.headline || car.name} onClose={close}>
      {phase === "quoting" && (
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {["quoted", "dismissed", "failed"].includes(phase) && quote && (
        <>
          {phase === "failed" && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <Icons.alert className="mt-0.5 shrink-0" /> {message}
            </div>
          )}
          {phase === "dismissed" && order && (
            <div className="mb-4 rounded-xl bg-[#fdf1dc] px-4 py-3 text-sm text-[#b45309]">
              Payment not completed. We're still holding the car for you until {formatDateTime(order.expiresAt)}.
            </div>
          )}

          <div className="divide-y divide-[#f1eee8] rounded-xl border border-[#efece6] px-4">
            <Row label="Car price" value={formatPaise(quote.carPricePaise)} />
            <Row label="Pay now (booking amount)" value={formatPaise(quote.bookingAmountPaise)} strong />
            <Row label="Pay later, at delivery" value={formatPaise(quote.carPricePaise - quote.bookingAmountPaise)} />
          </div>

          <ul className="mt-4 space-y-2 text-xs leading-5 text-[#6b6b6b]">
            <li className="flex gap-2"><Icons.check width={12} height={12} className="mt-1.5 shrink-0 text-[#0f9d8a]" />
              We hold this car for you for {quote.holdMinutes} minutes while you pay.</li>
            <li className="flex gap-2"><Icons.check width={12} height={12} className="mt-1.5 shrink-0 text-[#0f9d8a]" />
              After payment you get the seller's contact to arrange the inspection.</li>
            <li className="flex gap-2"><Icons.check width={12} height={12} className="mt-1.5 shrink-0 text-[#0f9d8a]" />
              Secure payment by Razorpay: UPI, cards or net banking.</li>
          </ul>

          <button type="button" onClick={pay} className={`${primary} mt-5`}>
            <Icons.lock width={18} height={18} />
            {phase === "quoted" ? `Pay ${formatPaise(quote.bookingAmountPaise)} & reserve` : "Try payment again"}
          </button>
          {phase !== "quoted" && (
            <button type="button" onClick={release} className={`${secondary} mt-3`}>
              Release the car &amp; cancel
            </button>
          )}
        </>
      )}

      {phase === "creating" && <Spinner text="Reserving the car for you…" />}
      {phase === "paying" && <Spinner text="Complete the payment in the Razorpay window…" />}
      {phase === "verifying" && <Spinner text="Payment received. Confirming with the bank…" />}
      {phase === "pending" && (
        <>
          <Spinner text="Your payment is being confirmed. This usually takes a few seconds." />
          <Link to="/dashboard?tab=orders" className={secondary}>
            Check my orders
          </Link>
        </>
      )}

      {phase === "unavailable" && (
        <>
          <div className="rounded-xl bg-[#efece6] px-4 py-3 text-sm text-[#6b6b6b]">
            {message || "This car has just been booked by someone else or is no longer available."}
          </div>
          <Link to="/browse-cars" className={`${primary} mt-5`}>Browse other cars</Link>
        </>
      )}

      {phase === "error" && (
        <>
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <Icons.alert className="mt-0.5 shrink-0" /> {message || "Something went wrong."}
          </div>
          <button type="button" onClick={retryQuote} className={`${primary} mt-5`}>Try again</button>
          <Link to="/dashboard?tab=orders" className={`${secondary} mt-3`}>Check my orders</Link>
        </>
      )}
    </Modal>
  );
}
