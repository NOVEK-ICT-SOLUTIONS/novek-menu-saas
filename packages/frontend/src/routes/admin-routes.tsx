import { Navigate, Route } from "react-router-dom";
import AdminLogsPage from "@/features/admin/pages/AdminLogsPage";
import AdminOverviewPage from "@/features/admin/pages/AdminOverviewPage";
import AdminRestaurantDetailPage from "@/features/admin/pages/AdminRestaurantDetailPage";
import AdminRestaurantStatsPage from "@/features/admin/pages/AdminRestaurantStatsPage";
import AdminRestaurantsPage from "@/features/admin/pages/AdminRestaurantsPage";
import AdminUsersPage from "@/features/admin/pages/AdminUsersPage";

export const adminRoutes = [
  <Route key="admin-root" path="admin" element={<Navigate to="/admin/overview" replace />} />,
  <Route key="admin-overview" path="admin/overview" element={<AdminOverviewPage />} />,
  <Route key="admin-users" path="admin/users" element={<AdminUsersPage />} />,
  <Route key="admin-restaurants" path="admin/restaurants" element={<AdminRestaurantsPage />} />,
  <Route key="admin-restaurant-stats" path="admin/restaurant-stats" element={<AdminRestaurantStatsPage />} />,
  <Route
    key="admin-restaurant-detail"
    path="admin/restaurants/:restaurantId"
    element={<AdminRestaurantDetailPage />}
  />,
  <Route key="admin-logs" path="admin/logs" element={<AdminLogsPage />} />,
];
