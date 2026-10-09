import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout, {
  Field,
  PasswordField,
  SubmitButton,
  GoogleButton,
  OrDivider,
  Reveal,
  MailIcon,
} from "../components/AuthLayout";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Enter your password";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    // TODO: replace with your real login API call
    await new Promise((r) => setTimeout(r, 1200));
    console.log("login", form);
    setLoading(false);
  };

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