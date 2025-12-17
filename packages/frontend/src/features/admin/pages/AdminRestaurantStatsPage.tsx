import { MdCategory, MdFastfood, MdQrCode2, MdRestaurant, MdTrendingUp } from "react-icons/md";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurantStats } from "../services/admin.queries";

const AdminRestaurantStatsPage = () => {
  const { data: restaurants, isLoading } = useRestaurantStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Restaurant Statistics</h1>
        <div className="grid gap-4">
          {["stat-1", "stat-2", "stat-3"].map((skeletonId) => (
            <Card key={skeletonId}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalScans = restaurants?.reduce((sum, r) => sum + r.totalScans, 0) || 0;
  const totalScansThisMonth = restaurants?.reduce((sum, r) => sum + r.scansThisMonth, 0) || 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Restaurant Performance</h1>
        <p className="text-sm md:text-base text-muted-foreground">Detailed QR scan analytics and engagement metrics per restaurant</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Scans</CardTitle>
            <MdQrCode2 className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans.toLocaleString()}</div>
            <p className="text-xs text-green-600 font-medium">+{totalScansThisMonth.toLocaleString()} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Restaurant</CardTitle>
            <MdTrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants && restaurants.length > 0
                ? Math.max(...restaurants.map((r) => r.totalScans)).toLocaleString()
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {restaurants && restaurants.length > 0
                ? restaurants.reduce((prev, curr) => (curr.totalScans > prev.totalScans ? curr : prev)).name
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Scans</CardTitle>
            <MdCategory className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants && restaurants.length > 0 ? Math.round(totalScansThisMonth / restaurants.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per restaurant this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <MdRestaurant className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurants && restaurants.length > 0
                ? Math.round((restaurants.filter((r) => r.scansThisMonth > 0).length / restaurants.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {restaurants ? restaurants.filter((r) => r.scansThisMonth > 0).length : 0}/{restaurants?.length || 0} active
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Restaurant Performance</CardTitle>
          <CardDescription className="text-xs md:text-sm">Detailed metrics for each restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restaurants && restaurants.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium">Restaurant</th>
                        <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium hidden md:table-cell">Owner</th>
                        <th className="p-2 md:p-3 text-center text-xs md:text-sm font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <MdCategory className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Categories</span>
                          </div>
                        </th>
                        <th className="p-2 md:p-3 text-center text-xs md:text-sm font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <MdFastfood className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Items</span>
                          </div>
                        </th>
                        <th className="p-2 md:p-3 text-center text-xs md:text-sm font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <MdQrCode2 className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Total</span>
                          </div>
                        </th>
                        <th className="p-2 md:p-3 text-center text-xs md:text-sm font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <MdTrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Month</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.map((restaurant) => (
                        <tr key={restaurant.id} className="border-b hover:bg-muted/30">
                          <td className="p-2 md:p-3">
                            <div>
                              <div className="text-xs md:text-sm font-medium">{restaurant.name}</div>
                              <div className="text-xs text-muted-foreground">/{restaurant.slug}</div>
                            </div>
                          </td>
                          <td className="p-2 md:p-3 text-xs md:text-sm text-muted-foreground hidden md:table-cell">{restaurant.ownerEmail}</td>
                          <td className="p-2 md:p-3 text-center text-xs md:text-sm">{restaurant.totalCategories}</td>
                          <td className="p-2 md:p-3 text-center text-xs md:text-sm">{restaurant.totalMenuItems}</td>
                          <td className="p-2 md:p-3 text-center text-xs md:text-sm font-medium">{restaurant.totalScans}</td>
                          <td className="p-2 md:p-3 text-center">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              {restaurant.scansThisMonth}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No restaurants found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRestaurantStatsPage;
