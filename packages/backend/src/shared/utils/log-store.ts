interface LogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  action: string;
  user: string | null;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

class LogStore {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  addLog(entry: Omit<LogEntry, "id" | "timestamp">) {
    const log: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...entry,
    };

    this.logs.unshift(log);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(limit = 100): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  getLogsByLevel(level: string, limit = 100): LogEntry[] {
    return this.logs.filter((log) => log.level === level).slice(0, limit);
  }

  clear() {
    this.logs = [];
  }
}

export const logStore = new LogStore();

// Helper function to log actions
export const logAction = (
  level: "info" | "warning" | "error" | "success",
  action: string,
  details: string,
  user: string | null = null,
  req?: { ip?: string; get: (header: string) => string | undefined },
) => {
  logStore.addLog({
    level,
    action,
    user,
    details,
    ipAddress: req?.ip,
    userAgent: req?.get("user-agent"),
  });
};
