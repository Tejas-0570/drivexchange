// src/pages/ListCar.jsx
// Two routes use this page:
//   /list-car          -> create a new listing
//   /cars/:id/edit     -> same form, pre-filled, saves with PUT
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { createCar, PHOTO_UPLOAD_ENABLED, updateCar, uploadCarPhotos } from "../api/dashboardApi";
import { getCarById } from "../api/carApi";
import { Card, EmptyState, ErrorBanner, Icons, Skeleton } from "../components/dashboard/ui";
import Stepper from "../components/listcar/Stepper";
import Preview from "../components/listcar/Preview";
import { StepPhotos, StepPricing, StepReview, StepSpecs, StepVehicle } from "../components/listcar/Steps";
import {
  buildPayload,
  carToValues,
  firstInvalidStep,
  INITIAL_VALUES,
  stepsFor,
  suggestTitle,
  validateStep,
} from "../components/listcar/carFormConfig";

const DRAFT_KEY = "drivexchange_car_draft_v2"; // v2: the form now has a Photos step

// photos are File objects and can't be saved in localStorage -> drafts never include them
const loadDraft = () => {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return d && d.values ? d : null;
  } catch {
    return null;
  }
};

/* the route component: `key` makes React start fresh when switching between create and edit */
export default function ListCar() {
  const { id } = useParams();
  return <ListCarForm key={id ?? "new"} carId={id ?? null} />;
}

function ListCarForm({ carId }) {
  const editing = Boolean(carId);
  const steps = useMemo(() => stepsFor(editing), [editing]);
  const LAST = steps.length - 1;

  const { logout } = useAuth();
  const navigate = useNavigate();

  /* ---------------- edit mode: load the car first ---------------- */
  const [load, setLoad] = useState({ loading: editing, error: "", notFound: false, locked: "", car: null });

  useEffect(() => {
    if (!editing) return;
    const ctrl = new AbortController();

    getCarById(carId, ctrl.signal)
      .then((car) => {
        if (!car.isOwner) {
          navigate("/dashboard?tab=listings", { replace: true }); // not your car
          return;
        }
        if (car.status !== "AVAILABLE") {
          setLoad({ loading: false, error: "", notFound: false, locked: car.status, car });
          return;
        }
        setValues(carToValues(car));
        setMaxReached(LAST); // every step is already filled -> allow jumping anywhere
        setLoad({ loading: false, error: "", notFound: false, locked: "", car });
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (err.status === 401 || err.status === 403) return logout();
        setLoad({
          loading: false,
          notFound: err.status === 404 || err.status === 400,
          error: err.status === 404 || err.status === 400 ? "" : err.message || "Could not load this listing.",
          locked: "",
          car: null,
        });
      });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId]);

  /* ---------------- form state ---------------- */
  // restore an unfinished draft (create mode only; never resume directly on the review step)
  const [values, setValues] = useState(() => ({
    ...INITIAL_VALUES,
    ...(editing ? {} : loadDraft()?.values ?? {}),
    photos: [],
    confirm: false,
  }));
  const [step, setStep] = useState(() =>
    editing ? 0 : Math.min(loadDraft()?.step ?? 0, steps.length - 2)
  );
  const [maxReached, setMaxReached] = useState(step);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(null); // { title, id, photoWarning } when done

  // free the temporary photo previews when leaving the page
  const photosRef = useRef(values.photos);
  photosRef.current = values.photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  // keep the draft in the browser while the user is typing (create mode only)
  useEffect(() => {
    if (editing || published) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ values: { ...values, photos: [], confirm: false }, step })
      );
    } catch {
      /* storage blocked — ignore */
    }
  }, [values, step, published, editing]);

  const pristine =
    JSON.stringify({ ...values, photos: [], confirm: false }) === JSON.stringify(INITIAL_VALUES) &&
    values.photos.length === 0;

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
    const found = validateStep(steps[step].id, values);
    setErrors(found);
    if (Object.keys(found).length) return;

    const next = step + 1;
    // pre-fill the title when entering the pricing step
    if (steps[next].id === "pricing" && !values.title.trim()) {
      setValues((v) => ({ ...v, title: suggestTitle(v) }));
    }
    setMaxReached((m) => Math.max(m, next));
    goTo(next);
  };

  const handlePublish = async () => {
    // confirmation checkbox on the review step (create only)
    const reviewErrors = editing ? {} : validateStep("review", values);
    setErrors(reviewErrors);
    if (Object.keys(reviewErrors).length) return;

    // safety net: something earlier may have been edited into an invalid state
    const bad = firstInvalidStep(values, steps);
    if (bad !== -1) {
      goTo(bad);
      setErrors(validateStep(steps[bad].id, values));
      return;
    }

    setSubmitting(true);
    setServerError("");
    try {
      const title = values.title.trim();

      if (editing) {
        await updateCar(carId, buildPayload(values, { editing: true })); // PUT /api/v1/cars/{id}
        setPublished({ title, id: carId, updated: true });
      } else {
        const res = await createCar(buildPayload(values)); // POST /api/v1/cars/list-car
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }

        // optional photos: a failed upload must not undo the listing
        let photoWarning = "";
        const newId = res?.data?.id ?? res?.data?.car_id ?? res?.data?.carId ?? res?.id ?? res?.car_id ?? null;
        if (PHOTO_UPLOAD_ENABLED && values.photos.length > 0) {
          try {
            if (!newId) throw new Error("no car id in response");
            await uploadCarPhotos(newId, values.photos.map((p) => p.file));
          } catch {
            photoWarning = "Your car is listed, but the photos couldn't be uploaded. Please try again later.";
          }
        }
        setPublished({ title, id: newId, updated: false, photoWarning });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err.status === 401) {
        logout();
      } else if (err.status === 409 && !editing) {
        goTo(steps.findIndex((s) => s.id === "vehicle"));
        setErrors({ vin: "A car with this VIN is already listed" });
      } else if (err.status === 409) {
        // e.g. the car was reserved while the owner was editing
        setServerError(err.message || "This car can't be changed right now.");
      } else if (err.status === 403 || err.status === 404) {
        setServerError("You can't change this listing. It may have been removed.");
      } else {
        setServerError(err.message || "Could not save your listing. Please try again.");
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
    values.photos.forEach((p) => URL.revokeObjectURL(p.url));
    setValues({ ...INITIAL_VALUES });
    setErrors({});
    setServerError("");
    setStep(0);
    setMaxReached(0);
    setPublished(null);
  };

  const current = steps[step];
  const stepProps = { values, errors, onChange };
  const backTo = "/dashboard?tab=listings";

  /* ---------------- edit mode: loading / problems ---------------- */
  const shell = (children) => (
    <div className="min-h-screen bg-[#faf8f4] font-['Manrope',system-ui,sans-serif]">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-10">{children}</main>
      <Footer />
    </div>
  );

  if (editing && load.loading) {
    return shell(
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-[560px] w-full rounded-2xl" />
        <Skeleton className="hidden h-80 w-full lg:block" />
      </div>
    );
  }
  if (editing && load.notFound) {
    return shell(
      <EmptyState
        icon="car"
        title="We couldn't find that listing"
        text="It may have been removed."
        action={<Link to={backTo} className="inline-flex rounded-xl bg-[#1a6bff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6]">Back to my listings</Link>}
      />
    );
  }
  if (editing && load.error) {
    return shell(<ErrorBanner message={load.error} onRetry={() => navigate(0)} />);
  }
  if (editing && load.locked) {
    return shell(
      <EmptyState
        icon="shield"
        title="This listing can't be edited"
        text={
          load.locked === "RESERVED"
            ? "A buyer has reserved this car, so the details are locked until the deal is completed or cancelled."
            : "This car is no longer available, so its listing can't be changed."
        }
        action={<Link to={backTo} className="inline-flex rounded-xl bg-[#1a6bff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5ae6]">Back to my listings</Link>}
      />
    );
  }
  if (editing && !load.car) return <Navigate to={backTo} replace />;

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
              {published.updated ? "Listing updated!" : "Your car is listed!"}
            </h1>
            <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-7 text-[#8c8c8c]">
              {published.updated ? (
                <>Your changes to “{published.title}” are live.</>
              ) : (
                <>“{published.title}” was submitted. Our team will review it, and it goes live once approved. You can follow it in <strong className="text-[#1c1c1e]">My Listings</strong>.</>
              )}
            </p>
            {published.photoWarning && (
              <p className="mx-auto mt-4 max-w-[420px] rounded-xl bg-[#fdf1dc] px-4 py-3 text-sm text-[#b45309]">{published.photoWarning}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="rounded-xl bg-[#1a6bff] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6]"
              >
                View my listings
              </button>
              {published.updated ? (
                <button
                  type="button"
                  onClick={() => navigate(`/cars/${published.id}`)}
                  className="rounded-xl border border-[#e6e2da] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff]"
                >
                  See the listing
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-xl border border-[#e6e2da] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#1c1c1e] transition hover:border-[#1a6bff]"
                >
                  List another car
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* ---------------- header ---------------- */}
            <div className="mb-8">
              <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8c8c8c] transition hover:text-[#1a6bff]">
                <Icons.arrow width={14} height={14} className="rotate-180" /> Back to dashboard
              </Link>
              <h1 className="mt-3 font-['Fraunces',Georgia,serif] text-3xl font-bold tracking-tight text-[#1c1c1e] sm:text-4xl">
                {editing ? "Edit your listing" : "List your car"}
              </h1>
              <p className="mt-1.5 text-[15px] text-[#8c8c8c]">
                {editing
                  ? "Fix any detail, then save. Changes go live straight away."
                  : "A few quick steps and your car is in front of verified buyers."}
              </p>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
              {/* ---------------- wizard ---------------- */}
              <div>
                <Card className="p-6 sm:p-8">
                  <Stepper steps={steps} current={step} maxReached={maxReached} onJump={goTo} />

                  <div key={step} className="lc-in mt-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a6bff]">
                      Step {step + 1} of {steps.length}
                    </p>
                    <h2 className="mt-2 font-['Fraunces',Georgia,serif] text-2xl font-bold tracking-tight text-[#1c1c1e]">
                      {current.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-[#8c8c8c]">{current.subtitle}</p>

                    <form onSubmit={handleSubmit} noValidate className="mt-7">
                      {current.id === "vehicle" && <StepVehicle {...stepProps} editing={editing} />}
                      {current.id === "specs" && <StepSpecs {...stepProps} />}
                      {current.id === "photos" && <StepPhotos {...stepProps} />}
                      {current.id === "pricing" && <StepPricing {...stepProps} />}
                      {current.id === "review" && (
                        <StepReview {...stepProps} onEdit={goTo} steps={steps} editing={editing} />
                      )}

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
                          {step === LAST
                            ? editing
                              ? submitting ? "Saving..." : "Save changes"
                              : submitting ? "Publishing..." : "Publish listing"
                            : current.id === "photos" && values.photos.length === 0
                            ? "Skip for now →"
                            : "Continue →"}
                        </button>
                      </div>
                    </form>
                  </div>
                </Card>

                {!editing && !pristine && (
                  <p className="mt-4 text-center text-xs text-[#a8a59e]">
                    Draft saved on this device (photos aren't saved in drafts) ·{" "}
                    <button type="button" onClick={resetAll} className="font-semibold text-[#8c8c8c] underline hover:text-red-600">
                      Clear form
                    </button>
                  </p>
                )}
              </div>

              {/* ---------------- live preview ---------------- */}
              <aside className="hidden lg:block">
                <div className="sticky top-[124px]">
                  <Preview values={values} stepId={current.id} coverUrl={load.car?.images?.[0] ?? null} />
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
