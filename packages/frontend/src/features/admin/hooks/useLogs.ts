import { useQuery } from "@tanstack/react-query";
import { AdminLogsApi } from "../api/admin-logs.api";

export const ADMIN_LOGS_QUERY_KEY = "adminLogs";

export const useLogs = () => {
  return useQuery({
    queryKey: [ADMIN_LOGS_QUERY_KEY],
    queryFn: () => AdminLogsApi.getAllLogs(),
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Auto-refresh every 5 seconds
    retry: 1,
  });
};
