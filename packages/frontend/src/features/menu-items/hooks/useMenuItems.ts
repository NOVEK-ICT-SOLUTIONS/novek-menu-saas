import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type CreateMenuItemData,
  type MenuItem,
  type UpdateMenuItemData,
  menuItemService,
} from "../menu-items.service";

export const menuItemKeys = {
  all: ["menuItems"] as const,
  lists: () => [...menuItemKeys.all, "list"] as const,
  byCategory: (categoryId: string) => [...menuItemKeys.lists(), categoryId] as const,
  details: () => [...menuItemKeys.all, "detail"] as const,
  detail: (id: string) => [...menuItemKeys.details(), id] as const,
} as const;

const invalidateRelatedQueries = (queryClient: ReturnType<typeof useQueryClient>, categoryId: string) => {
  queryClient.invalidateQueries({ queryKey: menuItemKeys.byCategory(categoryId) });
  queryClient.invalidateQueries({ queryKey: ["categories"] });
  queryClient.invalidateQueries({ queryKey: ["restaurants"] });
};

export const useMenuItemsByCategory = (categoryId: string) =>
  useQuery<MenuItem[]>({
    queryKey: menuItemKeys.byCategory(categoryId),
    queryFn: () => menuItemService.getAllByCategory(categoryId),
    enabled: !!categoryId,
  });

export const useMenuItem = (id: string) =>
  useQuery<MenuItem>({
    queryKey: menuItemKeys.detail(id),
    queryFn: () => menuItemService.getById(id),
    enabled: !!id,
  });

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuItemData) => menuItemService.create(data),
    onSuccess: (_, variables) => {
      invalidateRelatedQueries(queryClient, variables.categoryId);
      toast.success("Item created successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to create item");
    },
  });
};

export const useUpdateMenuItem = (categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemData }) => menuItemService.update(id, data),
    onSuccess: (_, variables) => {
      invalidateRelatedQueries(queryClient, categoryId);
      queryClient.invalidateQueries({ queryKey: menuItemKeys.detail(variables.id) });
      toast.success("Item updated successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update item");
    },
  });
};

export const useDeleteMenuItem = (categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuItemService.delete(id),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient, categoryId);
      toast.success("Item deleted successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to delete item");
    },
  });
};

export const useMenuItems = (categoryId: string) => useMenuItemsByCategory(categoryId);
