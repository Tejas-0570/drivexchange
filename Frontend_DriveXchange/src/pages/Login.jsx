import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import AuthLayout, {
  Field,
  PasswordField,
  SubmitButton,
  GoogleButton,
  OrDivider,
  Reveal,
  MailIcon,
} from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isLoggedIn } = useAuth();
  const location = useLocation();

  // ProtectedRoute stores where the user was heading; default is home
  const redirectTo = location.state?.from?.pathname ?? "/";

  // coming from Signup: show a success message and pre-fill the email
  const justRegistered = location.state?.registered === true;

  const [form, setForm] = useState({
    email: location.state?.email ?? "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Enter your password";
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
      await login(form.email.trim(), form.password, form.remember);
      // success: isLoggedIn becomes true and the <Navigate> below redirects
    } catch (err) {
      if ([400, 401, 403].includes(err.status)) {
        setServerError("Invalid email or password");
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) return <Navigate to={redirectTo} replace />;

  return (
    <AuthLayout
      panelTitle="Welcome back to a safer way to buy and sell cars"
      panelText="Pick up where you left off — your saved vehicles, conversations and secure transactions are waiting."
    >
      <Reveal>
        <h1 className="font-['Fraunces',Georgia,serif] text-4xl font-bold tracking-tight text-[#1c1c1e]">
          Welcome back
        </h1>
        <p className="mt-3 text-[15px] text-[#8c8c8c]">
          Log in to manage your listings, offers and invoices.
        </p>
      </Reveal>

      {justRegistered && (
        <div
          role="status"
          className="auth-fade mt-6 flex items-start gap-3 rounded-xl border border-[#bfe3dd] bg-[#e3f1ef] px-4 py-3 text-sm text-[#0f766e]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="mt-0.5 shrink-0">
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z" />
          </svg>
          Account created successfully! Please log in to continue.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Reveal delay={80}>
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

        <Reveal delay={140}>
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={update("password")}
            error={errors.password}
          />
        </Reveal>

        <Reveal delay={200} className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-[#5f5f5f]">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={update("remember")}
              className="h-4 w-4 rounded accent-[#1a6bff]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-[#1a6bff] hover:text-[#0f5ae6]">
            Forgot password?
          </Link>
        </Reveal>

        {serverError && (
          <div
            role="alert"
            className="auth-fade rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {serverError}
          </div>
        )}

        <Reveal delay={260}>
          <SubmitButton loading={loading}>{loading ? "Logging in..." : "Log In"}</SubmitButton>
        </Reveal>
      </form>

      <Reveal delay={320}>
        <OrDivider />
        <GoogleButton>Continue with Google</GoogleButton>

        <p className="mt-8 text-center text-sm text-[#8c8c8c]">
          New to DriveXchange?{" "}
          <Link to="/signup" className="font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
            Create an account
          </Link>
        </p>
      </Reveal>
    </AuthLayout>
  );
};

export default Login;