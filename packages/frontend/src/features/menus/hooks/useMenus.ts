import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateMenuRequest } from "@/shared/types/api.types";

interface Menu {
  id: string;
  name: string;
  restaurantId: string;
  isActive: boolean;
}

export const useMenu = (menuId: string) => {
  return useQuery({
    queryKey: ["menu", menuId],
    queryFn: async () => {
      const response = await apiClient.get<{ status: string; data: { menu: Menu } }>(`/menus/${menuId}`);
      return response.data.data.menu;
    },
    enabled: !!menuId,
  });
};

export const useMenus = (restaurantId: string) => {
  return useQuery({
    queryKey: ["menus", restaurantId],
    queryFn: async () => {
      const response = await apiClient.get<{ status: string; data: { menus: Menu[] } }>(
        `/menus/restaurant/${restaurantId}`,
      );
      return response.data.data.menus;
    },
    enabled: !!restaurantId,
  });
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, data }: { restaurantId: string; data: CreateMenuRequest }) => {
      const response = await apiClient.post<{ status: string; data: { menu: Menu } }>(
        `/menus/restaurant/${restaurantId}`,
        data,
      );
      return response.data.data.menu;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menus", variables.restaurantId] });
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/menus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};
