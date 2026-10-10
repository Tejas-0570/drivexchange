import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout, {
  Field,
  PasswordField,
  SubmitButton,
  GoogleButton,
  OrDivider,
  Reveal,
  MailIcon,
  UserIcon,
} from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["bg-[#e6e2da]", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#0f9d8a]"];

const getStrength = (p) => {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
};

const Signup = () => {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const strength = getStrength(form.password);

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (!form.terms) next.terms = "Please accept the terms to continue";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      // POST /api/v1/auth/register  (saves the user in the database)
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      // account created -> send them to the login page (email pre-filled)
      navigate("/login", {
        replace: true,
        state: { registered: true, email: form.email.trim() },
      });
    } catch (err) {
      if (err.status === 409) {
        // UserAlreadyExistsException (adjust the status if yours differs)
        setErrors({ email: "An account with this email already exists" });
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // already logged in (or just finished signing up) -> go home
  if (isLoggedIn) return <Navigate to="/" replace />;

  return (
    <AuthLayout
      panelTitle="Join a marketplace engineered for peace of mind"
      panelText="Verified buyers and sellers, escrow-backed payments and automatic invoices — free to get started."
    >
      <Reveal>
        <h1 className="font-['Fraunces',Georgia,serif] text-4xl font-bold tracking-tight text-[#1c1c1e]">
          Create your account
        </h1>
        <p className="mt-3 text-[15px] text-[#8c8c8c]">
          It takes less than a minute to get started.
        </p>
      </Reveal>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Reveal delay={80}>
          <Field
            id="name"
            label="Full name"
            autoComplete="name"
            placeholder="Jordan Smith"
            icon={<UserIcon />}
            value={form.name}
            onChange={update("name")}
            error={errors.name}
          />
        </Reveal>

        <Reveal delay={140}>
          <Field
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<MailIcon />}
            value={form.email}
            onChange={update("email")}
            error={errors.email}
          />
        </Reveal>

        <Reveal delay={200}>
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update("password")}
            error={errors.password}
          />

          {/* strength meter */}
          {form.password && (
            <div className="mt-3">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength ? strengthColors[strength] : "bg-[#e6e2da]"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-[#8c8c8c]">
                Password strength:{" "}
                <span className="font-medium text-[#1c1c1e]">{strengthLabels[strength]}</span>
              </p>
            </div>
          )}
        </Reveal>

        <Reveal delay={250}>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#5f5f5f]">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={update("terms")}
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#1a6bff]"
            />
            <span>
              I agree to the{" "}
              <a href="#terms" className="font-medium text-[#1a6bff] hover:text-[#0f5ae6]">Terms of Service</a>{" "}
              and{" "}
              <a href="#privacy" className="font-medium text-[#1a6bff] hover:text-[#0f5ae6]">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs text-red-500">{errors.terms}</p>}
        </Reveal>

        {/* error coming from the server */}
        {serverError && (
          <div
            role="alert"
            className="auth-fade rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}

        <Reveal delay={300}>
          <SubmitButton loading={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </SubmitButton>
        </Reveal>
      </form>

      <Reveal delay={350}>
        <OrDivider />
        <GoogleButton>Sign up with Google</GoogleButton>

        <p className="mt-7 text-center text-sm text-[#8c8c8c]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
            Log in
          </Link>
        </p>
      </Reveal>
    </AuthLayout>
  );
};

export default Signup;