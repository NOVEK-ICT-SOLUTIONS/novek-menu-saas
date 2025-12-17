import React from "react";
import { MdCategory, MdFastfood, MdQrCode2, MdRestaurant } from "react-icons/md";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRestaurantStats } from "../services";

const DashboardPage = React.memo(
  () => {
    const { user } = useAuth();
    const { data: stats, isLoading: loading } = useRestaurantStats();

    const statCards = React.useMemo(
      () => [
        {
          title: "Total Restaurants",
          value: stats?.restaurants || 0,
          description: "Active restaurants",
          icon: MdRestaurant,
          color: "text-blue-600",
        },
        {
          title: "Categories",
          value: stats?.categories || 0,
          description: "Menu categories",
          icon: MdCategory,
          color: "text-green-600",
        },
        {
          title: "Menu Items",
          value: stats?.menuItems || 0,
          description: "Total items",
          icon: MdFastfood,
          color: "text-orange-600",
        },
        {
          title: "QR Scans",
          value: stats?.qrScans || 0,
          description: "This month",
          icon: MdQrCode2,
          color: "text-purple-600",
        },
      ],
      [stats],
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.email?.split("@")[0]}!</h1>
          <p className="text-muted-foreground">Here's an overview of your restaurant management system</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? ["stat-skeleton-1", "stat-skeleton-2", "stat-skeleton-3", "stat-skeleton-4"].map((skeletonId) => (
                <Card key={skeletonId}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/restaurants" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Manage Restaurants</div>
                <div className="text-sm text-muted-foreground">Add or manage your restaurants</div>
              </Link>
              <Link to="/qr-codes" className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Generate QR Code</div>
                <div className="text-sm text-muted-foreground">Create scannable QR codes</div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates in your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">System operational</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">All services running</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
  () => true,
);

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
