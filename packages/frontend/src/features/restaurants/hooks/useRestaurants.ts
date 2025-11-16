import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateRestaurantRequest, Restaurant, UpdateRestaurantRequest } from "@/shared/types/api.types";

export const useRestaurants = () => {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const response = await apiClient.get<{ status: string; data: { restaurants: Restaurant[] } }>("/restaurants");
      return response.data.data.restaurants;
    },
  });
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: async () => {
      const response = await apiClient.get<{ status: string; data: { restaurant: Restaurant } }>(`/restaurants/${id}`);
      return response.data.data.restaurant;
    },
    enabled: !!id,
  });
};

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRestaurantRequest) => {
      const response = await apiClient.post<{ status: string; data: { restaurant: Restaurant } }>("/restaurants", data);
      return response.data.data.restaurant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRestaurantRequest }) => {
      const response = await apiClient.patch<{ status: string; data: { restaurant: Restaurant } }>(
        `/restaurants/${id}`,
        data,
      );
      return response.data.data.restaurant;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.id] });
    },
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/restaurants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
};
