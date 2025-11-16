import { Route, Routes } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import CustomerMenuPage from "@/features/restaurants/pages/CustomerMenuPage";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { DashboardLayout } from "@/shared/layouts/DashboardLayout";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { adminRoutes } from "./admin-routes";
import { ownerRoutes } from "./owner-routes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/menu/:slug" element={<CustomerMenuPage />} />
      <Route path="/:slug" element={<CustomerMenuPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Owner routes */}
        {ownerRoutes}

        {/* Admin routes */}
        {adminRoutes}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
