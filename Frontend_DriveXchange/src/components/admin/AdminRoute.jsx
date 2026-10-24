// src/components/admin/AdminRoute.jsx
// Wrap the whole /admin area with this.
//   not logged in      -> login page (and back here afterwards)
//   logged in, no ADMIN -> a "not allowed" page
//   ADMIN              -> the page
// NOTE: this only decides what the BROWSER shows. The server refuses non-admins on every
// /api/v1/admin/** call anyway, so a hand-made request gets 403 no matter what this file does.
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../dashboard/ui";
import { isAdminRole } from "../dashboard/format";

export default function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, profile, profileLoading } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location, notice: "Please log in to continue." }} />;
  }

  // the profile (fetched from /users/me) is the source of truth for the role;
  // until it arrives we fall back to the role inside the token
  if (!profile && profileLoading) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4 px-4 py-16">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const admin = profile ? isAdminRole(profile.roles) : isAdmin;
  if (!admin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf8f4] px-4 font-['Manrope',system-ui,sans-serif]">
        <div className="max-w-[420px] rounded-2xl border border-[#efece6] bg-white p-10 text-center shadow-[0_2px_10px_rgba(30,25,15,0.05)]">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fde8e8] text-[#c53030]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          </span>
          <h1 className="mt-5 font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#1c1c1e]">Admins only</h1>
          <p className="mt-2 text-sm leading-6 text-[#8c8c8c]">Your account doesn't have permission to open the Admin Console.</p>
          <Link to="/" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#1a6bff] py-3 text-sm font-semibold text-white hover:bg-[#0f5ae6]">
            Back to Drivexchange
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
