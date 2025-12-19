import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  // 🔴 Not logged in → go to login instantly
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🟢 Logged in → allow access
  return <Outlet />;
};

export default AuthGuard;
