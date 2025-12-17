import { Navigate, Route } from "react-router-dom";
import CategoriesPage from "@/features/categories/pages/CategoriesPage";
import MenuItemsPage from "@/features/menu-items/pages/MenuItemsPage";
import QRCodesPage from "@/features/qr-codes/pages/QRCodesPage";
import DashboardPage from "@/features/restaurants/pages/DashboardPage";
import RestaurantCustomizationPage from "@/features/restaurants/pages/RestaurantCustomizationPage";
import RestaurantsPage from "@/features/restaurants/pages/RestaurantsPage";

export const ownerRoutes = [
  <Route key="root" index element={<Navigate to="/dashboard" replace />} />,
  <Route key="dashboard" path="dashboard" element={<DashboardPage />} />,
  <Route key="restaurants" path="restaurants" element={<RestaurantsPage />} />,
  <Route key="restaurant-categories" path="restaurants/:restaurantId/categories" element={<CategoriesPage />} />,
  <Route key="category-items" path="categories/:categoryId/items" element={<MenuItemsPage />} />,
  <Route key="qr-codes" path="qr-codes" element={<QRCodesPage />} />,
  <Route key="settings" path="settings" element={<RestaurantCustomizationPage />} />,
];
