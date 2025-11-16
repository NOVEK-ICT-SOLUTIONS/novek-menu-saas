import { useQuery } from "@tanstack/react-query";
import { AdminRestaurantsApi } from "../api/admin-restaurants.api";

export const ADMIN_RESTAURANTS_QUERY_KEY = "admin-restaurants";

export function useRestaurants() {
  return useQuery({
    queryKey: [ADMIN_RESTAURANTS_QUERY_KEY],
    queryFn: () => AdminRestaurantsApi.getAllRestaurants(),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useRestaurantDetail(restaurantId: string | undefined) {
  return useQuery({
    queryKey: [ADMIN_RESTAURANTS_QUERY_KEY, restaurantId],
    queryFn: () => {
      if (!restaurantId) {
        throw new Error("Restaurant ID is required");
      }
      return AdminRestaurantsApi.getRestaurantById(restaurantId);
    },
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
