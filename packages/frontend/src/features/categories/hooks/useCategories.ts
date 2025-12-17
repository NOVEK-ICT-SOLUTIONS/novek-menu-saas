import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type Category,
  type CategoryWithItems,
  type CreateCategoryData,
  type UpdateCategoryData,
  categoryService,
} from "../categories.service";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  byRestaurant: (restaurantId: string) => [...categoryKeys.lists(), restaurantId] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
} as const;

const invalidateRelatedQueries = (queryClient: ReturnType<typeof useQueryClient>, restaurantId: string) => {
  queryClient.invalidateQueries({ queryKey: categoryKeys.byRestaurant(restaurantId) });
  queryClient.invalidateQueries({ queryKey: ["restaurants"] });
};

export const useCategoriesByRestaurant = (restaurantId: string) =>
  useQuery<CategoryWithItems[]>({
    queryKey: categoryKeys.byRestaurant(restaurantId),
    queryFn: () => categoryService.getAllByRestaurant(restaurantId),
    enabled: !!restaurantId,
  });

export const useCategory = (id: string) =>
  useQuery<CategoryWithItems>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryService.create(data),
    onSuccess: (_, variables) => {
      invalidateRelatedQueries(queryClient, variables.restaurantId);
      toast.success("Category created successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });
};

export const useUpdateCategory = (restaurantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) => categoryService.update(id, data),
    onSuccess: (_, variables) => {
      invalidateRelatedQueries(queryClient, restaurantId);
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      toast.success("Category updated successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = (restaurantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      invalidateRelatedQueries(queryClient, restaurantId);
      toast.success("Category deleted successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });
};

export const useCategories = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: categoryKeys.byRestaurant(restaurantId || ""),
    queryFn: async () => {
      if (!restaurantId) return [];
      const response = await categoryService.getAllByRestaurant(restaurantId);
      return response;
    },
    enabled: !!restaurantId,
  });

  const createMutation = useMutation({
    mutationFn: async ({ restaurantId: restId, data }: { restaurantId: string; data: { name: string } }) =>
      categoryService.create({ restaurantId: restId, name: data.name }),
    onSuccess: (_, variables) => {
      invalidateRelatedQueries(queryClient, variables.restaurantId);
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
