import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthNavbar from "../components/navigation/AuthNavbar";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthNavbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md px-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
