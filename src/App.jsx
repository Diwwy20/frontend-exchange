import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Loading from "./components/ui/Loading";

const HomePage = lazy(() => import("./pages/HomePage"));
const MarketPage = lazy(() => import("./pages/MarketPage"));
const TransferPage = lazy(() => import("./pages/TransferPage"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const Login = lazy(() => import("./components/auth/Login"));
const Register = lazy(() => import("./components/auth/Register"));

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
