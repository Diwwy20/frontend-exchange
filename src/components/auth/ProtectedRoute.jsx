import { Navigate } from "react-router-dom";
import Loading from "../ui/Loading";

const ProtectedRoute = ({ isAuthenticated, children, isLoading }) => {
  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
