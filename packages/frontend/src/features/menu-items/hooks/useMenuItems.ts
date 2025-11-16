import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { CreateMenuItemRequest, MenuItem, UpdateMenuItemRequest } from "@/shared/types/api.types";

export const useMenuItems = (menuId: string) => {
  return useQuery({
    queryKey: ["menuItems", menuId],
    queryFn: async () => {
      const response = await apiClient.get<{ status: string; data: { menuItems: MenuItem[] } }>(
        `/menu-items/menu/${menuId}`,
      );
      return response.data.data.menuItems;
    },
    enabled: !!menuId,
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, data }: { menuId: string; data: CreateMenuItemRequest }) => {
      const response = await apiClient.post<{ status: string; data: { menuItem: MenuItem } }>(
        `/menu-items/menu/${menuId}`,
        data,
      );
      return response.data.data.menuItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", variables.menuId] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMenuItemRequest }) => {
      const response = await apiClient.patch<{ status: string; data: { menuItem: MenuItem } }>(
        `/menu-items/${id}`,
        data,
      );
      return response.data.data.menuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });
};
