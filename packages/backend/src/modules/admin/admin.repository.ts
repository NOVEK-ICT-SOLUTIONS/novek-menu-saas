import { prisma } from "../../database/client";
import { logStore } from "../../shared/utils/log-store";

export class AdminRepository {
  async findAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            restaurants: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllRestaurants() {
    return prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        qrCodeUrl: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            menus: true,
            categories: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findRestaurantById(restaurantId: string) {
    return prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        qrCodeUrl: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        menus: {
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                menuItems: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        categories: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                menuItems: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });
  }

  async findAllMenus() {
    return prisma.menu.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSystemStats() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalRestaurants,
      totalMenus,
      totalMenuItems,
      newUsersThisMonth,
      newUsersLastMonth,
      activeMenus,
      totalQRScans,
      qrScansThisMonth,
      qrScansLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.menu.count(),
      prisma.menuItem.count(),
      prisma.user.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
      prisma.user.count({
        where: {
          createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth },
        },
      }),
      prisma.menu.count({ where: { isActive: true } }),
      prisma.qRScan.count(),
      prisma.qRScan.count({ where: { scannedAt: { gte: firstDayThisMonth } } }),
      prisma.qRScan.count({
        where: {
          scannedAt: { gte: firstDayLastMonth, lt: firstDayThisMonth },
        },
      }),
    ]);

    const userGrowth = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0;
    const scanGrowth = qrScansLastMonth > 0 ? ((qrScansThisMonth - qrScansLastMonth) / qrScansLastMonth) * 100 : 0;

    const avgMenusPerRestaurant = totalRestaurants > 0 ? totalMenus / totalRestaurants : 0;
    const avgItemsPerMenu = totalMenus > 0 ? totalMenuItems / totalMenus : 0;
    const avgScansPerRestaurant = totalRestaurants > 0 ? totalQRScans / totalRestaurants : 0;

    return {
      totalUsers,
      totalRestaurants,
      totalMenus,
      totalMenuItems,
      totalQRScans,
      qrScansThisMonth,
      newUsersThisMonth,
      activeMenus,
      userGrowth: Math.round(userGrowth),
      scanGrowth: Math.round(scanGrowth),
      avgMenusPerRestaurant: Number(avgMenusPerRestaurant.toFixed(1)),
      avgItemsPerMenu: Number(avgItemsPerMenu.toFixed(1)),
      avgScansPerRestaurant: Number(avgScansPerRestaurant.toFixed(1)),
    };
  }

  async getRestaurantStats() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        owner: {
          select: {
            email: true,
          },
        },
        _count: {
          select: {
            menus: true,
            categories: true,
            qrScans: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get QR scans this month for each restaurant
    const restaurantIds = restaurants.map(r => r.id);
    const scansThisMonth = await prisma.qRScan.groupBy({
      by: ["restaurantId"],
      where: {
        restaurantId: { in: restaurantIds },
        scannedAt: { gte: firstDayThisMonth },
      },
      _count: {
        id: true,
      },
    });

    const scansByRestaurant = Object.fromEntries(
      scansThisMonth.map(s => [s.restaurantId, s._count.id])
    );

    // Get menu items count for each restaurant
    const menuItemCounts = await prisma.menuItem.groupBy({
      by: ["menuId"],
      _count: {
        id: true,
      },
    });

    const menusByRestaurant = await prisma.menu.findMany({
      select: {
        id: true,
        restaurantId: true,
      },
    });

    const itemCountsByRestaurant: Record<string, number> = {};
    for (const menu of menusByRestaurant) {
      const count = menuItemCounts.find(m => m.menuId === menu.id)?._count.id || 0;
      itemCountsByRestaurant[menu.restaurantId] = (itemCountsByRestaurant[menu.restaurantId] || 0) + count;
    }

    return restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      ownerEmail: restaurant.owner.email,
      createdAt: restaurant.createdAt,
      totalMenus: restaurant._count.menus,
      totalCategories: restaurant._count.categories,
      totalMenuItems: itemCountsByRestaurant[restaurant.id] || 0,
      totalScans: restaurant._count.qrScans,
      scansThisMonth: scansByRestaurant[restaurant.id] || 0,
    }));
  }

  async updateUserRole(userId: string, role: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  async getLogs(limit = 100) {
    return logStore.getLogs(limit);
  }
}
