import { Navigate } from "react-router-dom";
import { useRole } from "@/context/RoleContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, role } = useRole();

  if (isAuthenticated && role) {
    // Redirect to appropriate dashboard if already logged in
    switch (role) {
      case "superadmin":
        return <Navigate to="/superadmin/dashboard" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "manager":
        return <Navigate to="/manager/dashboard" replace />;
      case "supervisor":
        return <Navigate to="/supervisor/dashboard" replace />;
      case "employee":
        return <Navigate to="/employee/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};