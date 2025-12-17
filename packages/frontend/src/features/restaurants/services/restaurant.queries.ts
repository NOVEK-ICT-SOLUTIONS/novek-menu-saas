import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type Restaurant,
  type RestaurantFormData,
  type RestaurantWithCategories,
  restaurantService,
} from "./restaurant.service";

export const restaurantKeys = {
  all: ["restaurants"] as const,
  lists: () => [...restaurantKeys.all, "list"] as const,
  list: (filters?: string) => [...restaurantKeys.lists(), { filters }] as const,
  details: () => [...restaurantKeys.all, "detail"] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
  bySlug: (slug: string) => [...restaurantKeys.all, "slug", slug] as const,
  stats: () => [...restaurantKeys.all, "stats"] as const,
} as const;

export const useRestaurants = () =>
  useQuery<Restaurant[]>({
    queryKey: restaurantKeys.lists(),
    queryFn: restaurantService.getAll,
  });

export const useRestaurant = (id: string, enabled = true) =>
  useQuery<RestaurantWithCategories>({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => restaurantService.getById(id),
    enabled: enabled && !!id,
  });

export const useRestaurantBySlug = (slug: string) =>
  useQuery<RestaurantWithCategories>({
    queryKey: restaurantKeys.bySlug(slug),
    queryFn: () => restaurantService.getBySlug(slug),
    retry: false,
    enabled: !!slug,
  });

export const useRestaurantStats = () =>
  useQuery({
    queryKey: restaurantKeys.stats(),
    queryFn: restaurantService.getStats,
  });

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RestaurantFormData }) => restaurantService.update(id, data),
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
    mutationFn: restaurantService.create,
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
    mutationFn: restaurantService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });
      toast.success("Restaurant deleted successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to delete restaurant");
    },
  });
};
