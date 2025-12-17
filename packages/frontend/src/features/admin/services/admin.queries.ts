import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService, type Stats, type User } from "./admin.service";

export const adminKeys = {
  all: ["admin"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
} as const;

export const useAdminUsers = () =>
  useQuery<User[]>({
    queryKey: adminKeys.users(),
    queryFn: adminService.getAllUsers,
  });

export const useAdminStats = () =>
  useQuery<Stats>({
    queryKey: adminKeys.stats(),
    queryFn: adminService.getStats,
  });

export const useRestaurantStats = () =>
  useQuery({
    queryKey: [...adminKeys.stats(), "restaurants"],
    queryFn: adminService.getRestaurantStats,
  });

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
