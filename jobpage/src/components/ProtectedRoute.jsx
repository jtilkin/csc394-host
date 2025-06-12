import { Navigate } from "react-router-dom";

/**
 * Protects routes from unauthenticated users (and optionally, based on role).
 *
 * @param {string|null} token - auth token (null if not logged in)
 * @param {string} [role] - optional user role (e.g. "user", "employer")
 * @param {string} [requiredRole] - if provided, only allows access if role matches
 * @param {ReactNode} children - the component(s) to render
 */
export default function ProtectedRoute({ token, role, requiredRole, children }) {
  // Not logged in at all
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Allowed through
  return children;
}


