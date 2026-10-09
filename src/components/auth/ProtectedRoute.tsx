import { Navigate, Outlet } from "react-router";
import { getToken } from "../../api/authSession";

export default function ProtectedRoute() {
  return getToken() ? <Outlet /> : <Navigate to="/signin" replace />;
}
