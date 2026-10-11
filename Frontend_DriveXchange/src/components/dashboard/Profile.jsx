// src/components/dashboard/ProfileTab.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../api/dashboardApi";
import { Field } from "../AuthLayout";
import { Card, ErrorBanner, Icons, Pill, SectionHeader } from "./ui";
import { EDITABLE_FIELDS, getCompleteness } from "./profileFields";
import { formatMonthYear, isAdminRole } from "./format";

const toValues = (profile) =>
  Object.fromEntries(EDITABLE_FIELDS.map((f) => [f.key, String(profile?.[f.key] ?? "")]));

const ReadOnlyRow = ({ icon, label, value, note, action }) => {
  const Icon = Icons[icon];
  return (
    <div className="flex items-start gap-4 border-b border-[#f1eee8] py-4 last:border-0">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#faf8f4] text-[#8c8c8c]">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#8c8c8c]">{label}</p>
        <p className="mt-0.5 truncate text-[15px] font-medium text-[#1c1c1e]">{value}</p>
        {note && <p className="mt-1 text-xs leading-5 text-[#a8a59e]">{note}</p>}
      </div>
      {action}
    </div>
  );
};

export default function ProfileTab({ onNavigate, notify }) {
  const { profile, setProfile, logout } = useAuth();

  const [values, setValues] = useState(() => toValues(profile));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  // whenever the profile from the database changes, reset the form to it
  useEffect(() => {
    setValues(toValues(profile));
    setErrors({});
  }, [profile]);

  const original = toValues(profile);
  const dirty = EDITABLE_FIELDS.some((f) => values[f.key].trim() !== original[f.key].trim());

  const { percent } = getCompleteness(profile);
  const initial = (profile?.name || profile?.email || "U")[0].toUpperCase();

  const change = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
  };

  const validate = () => {
    const next = {};
    EDITABLE_FIELDS.forEach((f) => {
      const msg = f.validate?.(values[f.key]) ?? "";
      if (msg) next[f.key] = msg;
    });
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    // ONLY the editable fields are sent — never email / password / role
    const payload = Object.fromEntries(
      EDITABLE_FIELDS.map((f) => [f.key, values[f.key].trim()])
    );

    setSaving(true);
    try {
      await updateProfile(payload); // PUT
      const fresh = await getProfile(); // re-read what the database really has
      setProfile(fresh);
      notify("Profile updated successfully");
    } catch (err) {
      if (err.status === 401) {
        logout();
      } else {
        setServerError(err.message || "Could not save your changes.");
      }
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setValues(toValues(profile));
    setErrors({});
    setServerError("");
  };

  return (
    <div>
      <SectionHeader
        title="My Profile"
        subtitle="Keep your details up to date so buyers and sellers can reach you."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ---------- editable form ---------- */}
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#1a6bff] to-[#0b57ef] text-2xl font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)]">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">
                {profile?.name || "Your name"}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#efece6]">
                  <div className="h-full rounded-full bg-[#0f9d8a] transition-all duration-700" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-xs text-[#8c8c8c]">{percent}% complete</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            {EDITABLE_FIELDS.map((f) => {
              const Icon = Icons[f.icon] ?? Icons.user;
              return (
                <div key={f.key}>
                  <Field
                    id={`profile-${f.key}`}
                    label={f.label}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    icon={<Icon />}
                    value={values[f.key]}
                    onChange={change(f.key)}
                    error={errors[f.key]}
                  />
                  {f.hint && !errors[f.key] && (
                    <p className="mt-1.5 text-xs text-[#a8a59e]">{f.hint}</p>
                  )}
                </div>
              );
            })}

            {serverError && <ErrorBanner message={serverError} />}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="w-full sm:w-auto sm:min-w-[170px]">
                <button
                  type="submit"
                  disabled={!dirty || saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a6bff] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(26,107,255,0.3)] transition hover:-translate-y-0.5 hover:bg-[#0f5ae6] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {saving && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  )}
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
              {dirty && !saving && (
                <button type="button" onClick={discard} className="rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#6b6b6b] transition hover:text-[#1c1c1e]">
                  Discard
                </button>
              )}
              {dirty && !saving && <span className="text-xs text-[#b45309]">Unsaved changes</span>}
            </div>
          </form>
        </Card>

        {/* ---------- read-only account details ---------- */}
        <Card className="h-fit p-6">
          <h2 className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#1c1c1e]">Account details</h2>
          <p className="mt-1 text-xs text-[#a8a59e]">These can't be edited directly for your security.</p>

          <div className="mt-2">
            <ReadOnlyRow
              icon="mail"
              label="Email address"
              value={profile?.email || "—"}
              note="Your email is your login ID."
              action={
                <button type="button" onClick={() => onNavigate("security")} className="shrink-0 text-xs font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
                  Change
                </button>
              }
            />
            <ReadOnlyRow
              icon="lock"
              label="Password"
              value="••••••••••"
              action={
                <button type="button" onClick={() => onNavigate("security")} className="shrink-0 text-xs font-semibold text-[#1a6bff] hover:text-[#0f5ae6]">
                  Change
                </button>
              }
            />
            <ReadOnlyRow
              icon="shield"
              label="Account type"
              value={
                <Pill tone={isAdminRole(profile?.roles) ? "amber" : "blue"}>
                  {isAdminRole(profile?.roles) ? "Admin" : "User"}
                </Pill>
              }
            />
            <ReadOnlyRow icon="user" label="Member since" value={formatMonthYear(profile?.createdAt)} />
          </div>
        </Card>
      </div>
    </div>
  );
}