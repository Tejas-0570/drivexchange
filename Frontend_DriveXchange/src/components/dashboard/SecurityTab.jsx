// src/components/dashboard/SecurityTab.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { changeEmail, changePassword } from "../../api/dashboardApi";
import { Field, PasswordField, SubmitButton } from "../AuthLayout";
import { Card, ErrorBanner, Icons, Modal, SectionHeader } from "./ui";

/* turn an API error into a friendly message */
const friendly = (err, fallback) => {
  if (err.status === 404) return "This feature isn't available on the server yet.";
  if (err.status === 400 || err.status === 401 || err.status === 403) {
    return err.message && !/^Request failed/.test(err.message) ? err.message : "Your current password looks incorrect.";
  }
  return err.message || fallback;
};

/* ---------------- change password ---------------- */
function ChangePasswordModal({ onClose, notify }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");

    const next = {};
    if (!form.current) next.current = "Enter your current password";
    if (form.next.length < 8) next.next = "Use at least 8 characters";
    else if (form.next === form.current) next.next = "New password must be different";
    if (form.confirm !== form.next) next.confirm = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next });
      notify("Password changed successfully");
      onClose();
    } catch (err) {
      setServerError(friendly(err, "Could not change your password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Change password" subtitle="Use a strong password you don't use anywhere else." onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <PasswordField id="cp-current" label="Current password" autoComplete="current-password" value={form.current} onChange={set("current")} error={errors.current} autoFocus />
        <PasswordField id="cp-new" label="New password" autoComplete="new-password" placeholder="At least 8 characters" value={form.next} onChange={set("next")} error={errors.next} />
        <PasswordField id="cp-confirm" label="Confirm new password" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
        {serverError && <ErrorBanner message={serverError} />}
        <SubmitButton loading={loading}>{loading ? "Updating..." : "Update password"}</SubmitButton>
      </form>
    </Modal>
  );
}

/* ---------------- change email ---------------- */
function ChangeEmailModal({ onClose, currentEmail }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");

    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    else if (form.email.trim().toLowerCase() === currentEmail?.toLowerCase()) next.email = "That's already your email";
    if (!form.password) next.password = "Enter your current password";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await changeEmail({ newEmail: form.email.trim(), currentPassword: form.password });
      // The login token is tied to the OLD email, so sign in again with the new one.
      logout();
      navigate("/login", {
        replace: true,
        state: { notice: "Email updated. Please log in with your new email.", email: form.email.trim() },
      });
    } catch (err) {
      setServerError(friendly(err, "Could not change your email."));
      setLoading(false);
    }
  };

  return (
    <Modal title="Change email" subtitle="You'll be signed out and asked to log in with the new email." onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field id="ce-email" label="New email address" type="email" autoComplete="email" placeholder="you@example.com" icon={<Icons.mail />} value={form.email} onChange={set("email")} error={errors.email} autoFocus />
        <PasswordField id="ce-password" label="Current password" autoComplete="current-password" value={form.password} onChange={set("password")} error={errors.password} />
        {serverError && <ErrorBanner message={serverError} />}
        <SubmitButton loading={loading}>{loading ? "Updating..." : "Update email"}</SubmitButton>
      </form>
    </Modal>
  );
}

/* ---------------- the tab ---------------- */
const Row = ({ icon, title, text, action }) => {
  const Icon = Icons[icon];
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-[#f1eee8] py-5 last:border-0">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f0ff] text-[#1a6bff]">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[#1c1c1e]">{title}</p>
        <p className="mt-0.5 truncate text-sm text-[#8c8c8c]">{text}</p>
      </div>
      {action}
    </div>
  );
};

const OutlineButton = ({ onClick, children, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
      danger
        ? "border-red-200 text-red-600 hover:bg-red-50"
        : "border-[#e6e2da] text-[#1c1c1e] hover:border-[#1a6bff] hover:text-[#1a6bff]"
    }`}
  >
    {children}
  </button>
);

export default function SecurityTab({ notify }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // "email" | "password" | null

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div>
      <SectionHeader title="Security" subtitle="Manage how you sign in to DriveXchange." />

      <Card className="px-6 sm:px-8">
        <Row
          icon="mail"
          title="Email address"
          text={profile?.email || "—"}
          action={<OutlineButton onClick={() => setModal("email")}>Change email</OutlineButton>}
        />
        <Row
          icon="lock"
          title="Password"
          text="Choose a strong password you don't reuse"
          action={<OutlineButton onClick={() => setModal("password")}>Change password</OutlineButton>}
        />
        <Row
          icon="logout"
          title="Sign out"
          text="Log out of DriveXchange on this device"
          action={<OutlineButton danger onClick={handleLogout}>Log out</OutlineButton>}
        />
      </Card>

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#a8a59e]">
        <Icons.shield width={14} height={14} className="mt-0.5 shrink-0" />
        Email and password changes ask for your current password and are processed separately from your profile details.
      </p>

      {modal === "password" && <ChangePasswordModal onClose={() => setModal(null)} notify={notify} />}
      {modal === "email" && <ChangeEmailModal onClose={() => setModal(null)} currentEmail={profile?.email} />}
    </div>
  );
}