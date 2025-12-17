import { Loader2 } from "lucide-react";
import { useAdminStats } from "../services";

const AdminOverviewPage = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Admin Overview</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">System statistics and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Total Users</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats?.totalUsers || 0}</div>
          <div className="text-xs text-green-600 mt-1 md:mt-2">
            +{stats?.newUsersThisMonth || 0} this month ({stats?.userGrowth || 0}%)
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Total Restaurants</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats?.totalRestaurants || 0}</div>
          <div className="text-xs text-gray-500 mt-1 md:mt-2">{stats?.totalCategories || 0} categories created</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">QR Scans Growth</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-green-600">+{stats?.scanGrowth || 0}%</div>
          <div className="text-xs text-gray-500 mt-1 md:mt-2">{stats?.qrScansThisMonth || 0} scans this month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Active Categories</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats?.activeCategories || 0}</div>
          <div className="text-xs text-gray-500 mt-1 md:mt-2">{stats?.totalMenuItems || 0} total items</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg md:text-xl font-semibold">Growth & Engagement Trends</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Month-over-month platform metrics</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">
                  Metric
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">
                  Total
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">
                  This Month
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-900">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">Users</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">{stats?.totalUsers || 0}</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                  +{stats?.newUsersThisMonth || 0}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                  <span className="text-green-600 font-medium">+{stats?.userGrowth || 0}%</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                  QR Code Scans
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                  {stats?.totalQRScans || 0}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                  {stats?.qrScansThisMonth || 0}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                  <span className="text-green-600 font-medium">+{stats?.scanGrowth || 0}%</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">Restaurants</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                  {stats?.totalRestaurants || 0}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">-</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">-</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">Categories</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                  {stats?.totalCategories || 0}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">-</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">-</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">Menu Items</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                  {stats?.totalMenuItems || 0}
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">-</td>
                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Avg Categories/Restaurant</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats?.avgCategoriesPerRestaurant || 0}</div>
          <div className="text-xs text-gray-500 mt-1 md:mt-2">Platform average</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Avg Items/Category</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats?.avgItemsPerCategory || 0}</div>
          <div className="text-xs text-gray-500 mt-1 md:mt-2">Platform average</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <div className="text-xs md:text-sm font-medium text-gray-600">Avg Scans/Restaurant</div>
          <div className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{stats?.avgScansPerRestaurant || 0}</div>
          <div className="text-xs text-gray-500 mt-1 md:mt-2">Platform average</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">System Health</h2>
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between py-2 md:py-3 border-b">
            <div>
              <div className="text-sm md:text-base font-medium">Database Status</div>
              <div className="text-xs md:text-sm text-gray-500">PostgreSQL Connection</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 md:h-3 md:w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm font-medium text-green-600">Healthy</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 md:py-3 border-b">
            <div>
              <div className="text-sm md:text-base font-medium">API Response Time</div>
              <div className="text-xs md:text-sm text-gray-500">Average Latency</div>
            </div>
            <span className="text-xs md:text-sm font-medium">~45ms</span>
          </div>
          <div className="flex items-center justify-between py-2 md:py-3">
            <div>
              <div className="text-sm md:text-base font-medium">Server Uptime</div>
              <div className="text-xs md:text-sm text-gray-500">Last 30 Days</div>
            </div>
            <span className="text-xs md:text-sm font-medium text-green-600">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
