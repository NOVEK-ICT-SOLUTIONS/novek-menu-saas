import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "../../../shared/types/api.types";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  action: string;
  user: string | null;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LogsResponse {
  logs: LogEntry[];
}

export const AdminLogsApi = {
  async getAllLogs(): Promise<LogEntry[]> {
    try {
      const response = await apiClient.get<ApiResponse<LogsResponse>>("/admin/logs");

      if (response.data.status === "success") {
        return response.data.data.logs;
      }

      throw new Error("Failed to fetch logs");
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  },
};
