// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any page that needs a logged-in user (dashboard, list-a-car, ...).
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // remember where they wanted to go, so login can send them back
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}