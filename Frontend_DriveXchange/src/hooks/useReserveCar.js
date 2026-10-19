// src/hooks/useReserveCar.js
// The whole "Reserve this car" journey as a small state machine, so the UI just renders `phase`.
//
//  quoting -> quoted -> creating -> paying -> verifying -> (navigate to /transactions/:id)
//                          |           |  \-> failed / dismissed  (retry = same order, no second reservation)
//                          |           \----> pending  (paid, but confirmation is slow: we poll the server)
//                          \-> error (car taken, server down ...)
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cancelOrder, createOrder, getQuote, getTransaction, verifyPayment } from "../api/paymentApi";
import useRazorpay from "./useRazorpay";

const POLL_EVERY_MS = 3000;
const POLL_FOR_MS = 90_000;

export default function useReserveCar(carId) {
  const navigate = useNavigate();
  const { open } = useRazorpay();

  const [phase, setPhase] = useState("quoting");
  const [quote, setQuote] = useState(null);
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");

  const alive = useRef(true);
  const timer = useRef(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const safe = (fn) => alive.current && fn();
  const goToOrder = useCallback((id) => navigate(`/transactions/${id}`, { state: { justPaid: true } }), [navigate]);

  /* ---- 1. ask the server how much it will cost ---- */
  const loadQuote = useCallback(async () => {
    setPhase("quoting");
    setMessage("");
    try {
      const q = await getQuote(carId);
      safe(() => {
        setQuote(q);
        setPhase(q.available ? "quoted" : "unavailable");
      });
    } catch (e) {
      safe(() => {
        setMessage(e.message || "Could not load the booking amount.");
        setPhase("error");
      });
    }
  }, [carId]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  /* ---- 4. paid, but the server hasn't confirmed yet -> poll until the webhook finishes the job ---- */
  const pollUntilPaid = useCallback(
    (transactionId) => {
      const startedAt = Date.now();
      setPhase("pending");
      const tick = async () => {
        try {
          const t = await getTransaction(transactionId);
          if (t.status !== "CREATED") return safe(() => goToOrder(transactionId));
        } catch {
          /* keep trying */
        }
        if (Date.now() - startedAt > POLL_FOR_MS) {
          // still nothing: send them to the order page, which keeps refreshing on its own
          return safe(() => goToOrder(transactionId));
        }
        timer.current = setTimeout(tick, POLL_EVERY_MS);
      };
      tick();
    },
    [goToOrder]
  );

  /* ---- 3. the popup said "paid": now make OUR server confirm it ---- */
  const confirmWithServer = useCallback(
    async (response, transactionId) => {
      safe(() => setPhase("verifying"));
      try {
        const res = await verifyPayment(response);
        if (res?.status && res.status !== "CREATED") return safe(() => goToOrder(transactionId));
        pollUntilPaid(transactionId);
      } catch (e) {
        // 400 = signature/amount did not match: do NOT treat it as paid.
        // Any other error (network, 502 ...) = the money may well have moved: wait for the webhook.
        if (e.status === 400) {
          safe(() => {
            setMessage("We could not verify this payment. If money was deducted, it will be refunded automatically.");
            setPhase("error");
          });
        } else {
          pollUntilPaid(transactionId);
        }
      }
    },
    [goToOrder, pollUntilPaid]
  );

  /* ---- 2. reserve the car + open Razorpay ---- */
  const pay = useCallback(async () => {
    setMessage("");
    let o = order;
    // the 15 minutes are over: that order is dead, so make a fresh one instead of paying a stale bill
    if (o && new Date(o.expiresAt).getTime() <= Date.now()) {
      o = null;
      setOrder(null);
    }
    if (!o) {
      setPhase("creating");
      try {
        o = await createOrder(carId);
        safe(() => setOrder(o));
      } catch (e) {
        safe(() => {
          setMessage(e.status === 409 ? "Sorry, someone else just booked this car." : e.message || "Could not start the payment.");
          setPhase(e.status === 409 ? "unavailable" : "error");
        });
        return;
      }
    }

    safe(() => setPhase("paying"));
    open(o, {
      onSuccess: (response) => confirmWithServer(response, o.transactionId),
      onFailed: (msg) =>
        safe(() => {
          setMessage(msg);
          setPhase("failed");
        }),
      onDismiss: () =>
        safe(() => {
          // the car stays held for the buyer until `expiresAt`, so "Try again" reuses the SAME order
          setPhase((p) => (p === "paying" ? "dismissed" : p));
        }),
    });
  }, [carId, order, open, confirmWithServer]);

  /* ---- the buyer changes their mind: free the car straight away ---- */
  const release = useCallback(async () => {
    if (order) {
      try {
        await cancelOrder(order.transactionId);
      } catch {
        /* if it fails, the hold simply expires on its own */
      }
    }
    safe(() => {
      setOrder(null);
      loadQuote();
    });
  }, [order, loadQuote]);

  return { phase, quote, order, message, pay, release, retryQuote: loadQuote };
}
