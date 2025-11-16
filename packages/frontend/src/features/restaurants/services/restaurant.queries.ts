import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type Restaurant,
  type RestaurantFormData,
  type RestaurantWithMenus,
  restaurantService,
} from "./restaurant.service";

// Query keys
export const restaurantKeys = {
  all: ["restaurants"] as const,
  lists: () => [...restaurantKeys.all, "list"] as const,
  list: (filters?: string) => [...restaurantKeys.lists(), { filters }] as const,
  details: () => [...restaurantKeys.all, "detail"] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
  bySlug: (slug: string) => [...restaurantKeys.all, "slug", slug] as const,
};

// Queries
export const useRestaurants = () => {
  return useQuery<Restaurant[]>({
    queryKey: restaurantKeys.lists(),
    queryFn: restaurantService.getAllRestaurants,
  });
};

export const useRestaurant = (id: string, enabled = true) => {
  return useQuery<Restaurant>({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => restaurantService.getRestaurantById(id),
    enabled: enabled && !!id,
  });
};

export const useRestaurantBySlug = (slug: string) => {
  return useQuery<RestaurantWithMenus>({
    queryKey: restaurantKeys.bySlug(slug),
    queryFn: () => restaurantService.getRestaurantBySlug(slug),
    retry: false,
  });
};

// Mutations
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RestaurantFormData }) =>
      restaurantService.updateRestaurant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });
      toast.success("Restaurant updated successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update restaurant");
    },
  });
};

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restaurantService.createRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });
      toast.success("Restaurant created successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to create restaurant");
    },
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restaurantService.deleteRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });
      toast.success("Restaurant deleted successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to delete restaurant");
    },
  });
};
