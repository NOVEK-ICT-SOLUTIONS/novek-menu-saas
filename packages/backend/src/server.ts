import "dotenv/config";
import { logAction } from "@shared/utils/log-store";
import { app } from "@/app";

const PORT = process.env.PORT || 3000;

// Add seed logs when server starts
const seedLogs = () => {
  logAction("success", "Server Start", `Server started on port ${PORT}`, "system");
  logAction("info", "System Initialization", "Database connection established", "system");
  logAction("info", "System Check", "All services running normally", "system");

  // Add some sample logs for demo
  setTimeout(() => {
    logAction("success", "User Login", "Admin user logged in", "admin@novekmenu.com");
  }, 2000);

  setTimeout(() => {
    logAction("warning", "High Load", "Server experiencing high request volume", "system");
  }, 5000);

  setTimeout(() => {
    logAction("success", "Restaurant Created", "New restaurant: Pizza Palace", "owner@example.com");
  }, 8000);
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedLogs();
});
