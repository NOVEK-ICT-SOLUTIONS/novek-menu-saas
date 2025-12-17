import { prisma } from "../../core/database/prisma.client.ts";
import type { UserRole } from "@prisma/client";

export const adminRepository = {
  findAllUsers: () => {
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
  },

  findAllRestaurants: () => {
    return prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        qrCodeUrl: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            categories: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findRestaurantById: (restaurantId: string) => {
    return prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        qrCodeUrl: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        categories: {
          select: {
            id: true,
            name: true,
            isActive: true,
            sortOrder: true,
            _count: {
              select: {
                items: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  getSystemStats: async () => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalRestaurants,
      totalCategories,
      totalMenuItems,
      newUsersThisMonth,
      newUsersLastMonth,
      activeCategories,
      totalQRScans,
      qrScansThisMonth,
      qrScansLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.category.count(),
      prisma.menuItem.count(),
      prisma.user.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
      prisma.user.count({
        where: {
          createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth },
        },
      }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.qRScan.count(),
      prisma.qRScan.count({ where: { scannedAt: { gte: firstDayThisMonth } } }),
      prisma.qRScan.count({
        where: {
          scannedAt: { gte: firstDayLastMonth, lt: firstDayThisMonth },
        },
      }),
    ]);

    const PERCENTAGE_MULTIPLIER = 100;
    const userGrowth = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * PERCENTAGE_MULTIPLIER : 0;
    const scanGrowth = qrScansLastMonth > 0 ? ((qrScansThisMonth - qrScansLastMonth) / qrScansLastMonth) * PERCENTAGE_MULTIPLIER : 0;

    const avgCategoriesPerRestaurant = totalRestaurants > 0 ? totalCategories / totalRestaurants : 0;
    const avgItemsPerCategory = totalCategories > 0 ? totalMenuItems / totalCategories : 0;
    const avgScansPerRestaurant = totalRestaurants > 0 ? totalQRScans / totalRestaurants : 0;

    return {
      totalUsers,
      totalRestaurants,
      totalCategories,
      totalMenuItems,
      totalQRScans,
      qrScansThisMonth,
      newUsersThisMonth,
      activeCategories,
      userGrowth: Math.round(userGrowth),
      scanGrowth: Math.round(scanGrowth),
      avgCategoriesPerRestaurant: Number(avgCategoriesPerRestaurant.toFixed(1)),
      avgItemsPerCategory: Number(avgItemsPerCategory.toFixed(1)),
      avgScansPerRestaurant: Number(avgScansPerRestaurant.toFixed(1)),
    };
  },

  getRestaurantStats: async () => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        createdAt: true,
        _count: {
          select: {
            categories: true,
            qrScans: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const restaurantIds = restaurants.map((r) => r.id);
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

    const scansByRestaurant = Object.fromEntries(scansThisMonth.map((s) => [s.restaurantId, s._count.id]));

    const itemCountsByRestaurant = await prisma.menuItem.groupBy({
      by: ["categoryId"],
      _count: {
        id: true,
      },
    });

    const categoriesByRestaurant = await prisma.category.findMany({
      select: {
        id: true,
        restaurantId: true,
      },
    });

    const itemsByRestaurant: Record<string, number> = {};
    for (const category of categoriesByRestaurant) {
      const count = itemCountsByRestaurant.find((c) => c.categoryId === category.id)?._count.id ?? 0;
      itemsByRestaurant[category.restaurantId] = (itemsByRestaurant[category.restaurantId] ?? 0) + count;
    }

    const owners = await prisma.user.findMany({
      where: { id: { in: restaurants.map((r) => r.ownerId) } },
      select: { id: true, email: true },
    });
    const ownerMap = Object.fromEntries(owners.map((o) => [o.id, o.email]));

    return restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      ownerEmail: ownerMap[restaurant.ownerId] ?? "Unknown",
      createdAt: restaurant.createdAt,
      totalCategories: restaurant._count.categories,
      totalMenuItems: itemsByRestaurant[restaurant.id] ?? 0,
      totalScans: restaurant._count.qrScans,
      scansThisMonth: scansByRestaurant[restaurant.id] ?? 0,
    }));
  },

  updateUserRole: (userId: string, role: UserRole) => {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  },
};
