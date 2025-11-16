import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService, type Menu, type Stats, type User } from "./admin.service";

// Query keys
export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  menus: () => [...adminKeys.all, "menus"] as const,
};

// Queries
export const useAdminUsers = () => {
  return useQuery<User[]>({
    queryKey: adminKeys.users(),
    queryFn: adminService.getAllUsers,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: adminService.getStats,
  });
};

export const useRestaurantStats = () => {
  return useQuery({
    queryKey: [...adminKeys.stats(), "restaurants"],
    queryFn: adminService.getRestaurantStats,
  });
};

export const useAdminMenus = () => {
  return useQuery<Menu[]>({
    queryKey: adminKeys.menus(),
    queryFn: adminService.getAllMenus,
  });
};

// Mutations
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success("User role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });
};
