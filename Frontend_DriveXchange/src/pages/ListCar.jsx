import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { createCar } from "../api/dashboardApi";
import { Card, ErrorBanner, Icons } from "../components/dashboard/ui";
import Stepper from "../components/listcar/Stepper";
import Preview from "../components/listcar/Preview";
import { StepPricing, StepReview, StepSpecs, StepVehicle } from "../components/listcar/Steps";
import {
  buildPayload,
  firstInvalidStep,
  INITIAL_VALUES,
  STEPS,
  suggestTitle,
  validateStep,
} from "../components/listcar/carFormConfig";

const DRAFT_KEY = "drivexchange_car_draft_v1";

const loadDraft = () => {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return d && d.values ? d : null;
  } catch {
    return null;
  }
};

const LAST = STEPS.length - 1;

export default function ListCar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // restore an unfinished draft (never resume directly on the review step)
  const [values, setValues] = useState(() => ({
    ...INITIAL_VALUES,
    ...(loadDraft()?.values ?? {}),
    confirm: false,
  }));
  const [step, setStep] = useState(() => Math.min(loadDraft()?.step ?? 0, LAST - 1));
  const [maxReached, setMaxReached] = useState(step);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(null); // { title } when done

  // keep the draft in the browser while the user is typing
  useEffect(() => {
    if (published) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: { ...values, confirm: false }, step }));
    } catch {
      /* storage blocked — ignore */
    }
  }, [values, step, published]);

  const pristine =
    JSON.stringify({ ...values, confirm: false }) === JSON.stringify(INITIAL_VALUES);

  const onChange = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const goTo = (i) => {
    setStep(i);
    setServerError("");
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    const found = validateStep(STEPS[step].id, values);
    setErrors(found);
    if (Object.keys(found).length) return;

    const next = step + 1;
    // pre-fill the title when entering the pricing step
    if (STEPS[next].id === "pricing" && !values.title.trim()) {
      setValues((v) => ({ ...v, title: suggestTitle(v) }));
    }
    setMaxReached((m) => Math.max(m, next));
    goTo(next);
  };

  const handlePublish = async () => {
    // confirmation checkbox on the review step
    const reviewErrors = validateStep("review", values);
    setErrors(reviewErrors);
    if (Object.keys(reviewErrors).length) return;

    // safety net: something earlier may have been edited into an invalid state
    const bad = firstInvalidStep(values);
    if (bad !== -1) {
      goTo(bad);
      setErrors(validateStep(STEPS[bad].id, values));
      return;
    }

    setSubmitting(true);
    setServerError("");
    try {
      await createCar(buildPayload(values)); // POST /api/v1/cars/list-car
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setPublished({ title: values.title.trim() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.status === 401) {
        logout();
      } else if (err.status === 409) {
        goTo(0);
        setErrors({ vin: "A car with this VIN is already listed" });
      } else {
        setServerError(err.message || "Could not publish your listing. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === LAST) handlePublish();
    else handleNext();
  };

  const resetAll = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setValues({ ...INITIAL_VALUES });
    setErrors({});
    setServerError("");
    setStep(0);
    setMaxReached(0);
    setPublished(null);
  };

  const current = STEPS[step];
  const stepProps = { values, errors, onChange };

  return (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      <style>{`
        @keyframes lcIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes lcPop { 0% { transform: scale(.6); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes lcDraw { to { stroke-dashoffset: 0; } }
        .lc-in { animation: lcIn .45s cubic-bezier(.22,.61,.36,1) both; }
        .lc-pop { animation: lcPop .6s cubic-bezier(.22,.61,.36,1) both; }
        .lc-draw { stroke-dasharray: 40; stroke-dashoffset: 40; animation: lcDraw .6s .35s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) { .lc-in, .lc-pop { animation: none; } .lc-draw { animation: none; stroke-dashoffset: 0; } }
      `}</style>

      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
        {published ? (
          /* ---------------- success ---------------- */
          <div className="lc-in mx-auto max-w-[520px] py-10 text-center">
            <span className="lc-pop mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#e3f1ef]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0f9d8a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path className="lc-draw" d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h1 className="mt-7 font-['Fraunces',Georgia,serif] text-4xl font-bold tracking-tight text-[#1c1c1e]">
              Your car is listed!
            </h1>
            <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-7 text-[#8c8c8c]">
              “{published.title}” is now live as <strong className="text-[#1c1c1e]">Available</strong>. You can see it in My Listings.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard?tab=listings")}
                className="rounded-xl bg-[#1a6bff] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6]"
              >
                View my listings
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-xl border border-[#e6e2da] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff]"
              >
                List another car
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ---------------- header ---------------- */}
            <div className="mb-8">
              <Link to="/dashboard?tab=listings" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8c8c8c] transition hover:text-[#1a6bff]">
                <Icons.arrow width={14} height={14} className="rotate-180" /> Back to dashboard
              </Link>
              <h1 className="mt-3 font-['Fraunces',Georgia,serif] text-3xl font-bold tracking-tight text-[#1c1c1e] sm:text-4xl">
                List your car
              </h1>
              <p className="mt-1.5 text-[15px] text-[#8c8c8c]">
                Four quick steps and your car is in front of verified buyers.
              </p>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
              {/* ---------------- wizard ---------------- */}
              <div>
                <Card className="p-6 sm:p-8">
                  <Stepper steps={STEPS} current={step} maxReached={maxReached} onJump={goTo} />

                  <div key={step} className="lc-in mt-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6bff]">
                      Step {step + 1} of {STEPS.length}
                    </p>
                    <h2 className="mt-2 font-['Fraunces',Georgia,serif] text-2xl font-bold tracking-tight text-[#1c1c1e]">
                      {current.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-[#8c8c8c]">{current.subtitle}</p>

                    <form onSubmit={handleSubmit} noValidate className="mt-7">
                      {current.id === "vehicle" && <StepVehicle {...stepProps} />}
                      {current.id === "specs" && <StepSpecs {...stepProps} />}
                      {current.id === "pricing" && <StepPricing {...stepProps} />}
                      {current.id === "review" && <StepReview {...stepProps} onEdit={goTo} />}

                      {serverError && (
                        <div className="mt-5">
                          <ErrorBanner message={serverError} />
                        </div>
                      )}

                      <div className="mt-8 flex items-center justify-between gap-3">
                        {step > 0 ? (
                          <button
                            type="button"
                            onClick={() => goTo(step - 1)}
                            className="rounded-xl border border-[#e6e2da] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff]"
                          >
                            ← Back
                          </button>
                        ) : (
                          <span />
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#1a6bff] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                          {submitting && (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                              <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                          )}
                          {step === LAST ? (submitting ? "Publishing..." : "Publish listing") : "Continue →"}
                        </button>
                      </div>
                    </form>
                  </div>
                </Card>

                {!pristine && (
                  <p className="mt-4 text-center text-xs text-[#a8a59e]">
                    Draft saved on this device ·{" "}
                    <button type="button" onClick={resetAll} className="font-semibold text-[#8c8c8c] underline hover:text-red-600">
                      Clear form
                    </button>
                  </p>
                )}
              </div>

              {/* ---------------- live preview ---------------- */}
              <aside className="hidden lg:block">
                <div className="sticky top-[124px]">
                  <Preview values={values} step={step} />
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}