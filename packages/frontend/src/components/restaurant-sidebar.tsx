import { Activity, BarChart3, FileText, Users } from "lucide-react";
import type * as React from "react";
import { MdDashboard, MdQrCode2, MdRestaurant, MdSettings } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/context/AuthContext";

const ownerNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: MdDashboard,
  },
  {
    title: "My Restaurants",
    url: "/restaurants",
    icon: MdRestaurant,
  },
  {
    title: "QR Codes",
    url: "/qr-codes",
    icon: MdQrCode2,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: MdSettings,
  },
];

const adminNavItems = [
  {
    title: "Overview",
    url: "/admin/overview",
    icon: BarChart3,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Restaurants",
    url: "/admin/restaurants",
    icon: MdRestaurant,
  },
  {
    title: "Restaurant Stats",
    url: "/admin/restaurant-stats",
    icon: MdQrCode2,
  },
  {
    title: "Menus",
    url: "/admin/menus",
    icon: FileText,
  },
  {
    title: "Activity Logs",
    url: "/admin/logs",
    icon: Activity,
  },
];

export function RestaurantSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

  const navItems = user?.role === "ADMIN" ? adminNavItems : ownerNavItems;

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MdRestaurant className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NovekMenu</span>
                  <span className="truncate text-xs">{user?.role || "Owner"}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} tooltip={item.title}>
                    <Link to={item.url} onClick={handleNavClick}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.email || "User",
            email: user?.email || "",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
