import { prisma } from "../../core/database/prisma.client.ts";
import type { UpdateRestaurantRequest } from "./restaurants.types.ts";

const restaurantSelectFields = {
  id: true,
  name: true,
  slug: true,
  location: true,
  contactEmail: true,
  contactPhone: true,
  primaryColor: true,
  backgroundColor: true,
  logoUrl: true,
  headerImageUrl: true,
  qrCodeUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

const categorySelectFields = {
  id: true,
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
} as const;

const menuItemSelectFields = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  isAvailable: true,
} as const;

export const restaurantsRepository = {
  findAllByOwner: (ownerId: string) => {
    return prisma.restaurant.findMany({
      where: { ownerId },
      select: restaurantSelectFields,
      orderBy: { createdAt: "desc" },
    });
  },

  findById: (id: string) => {
    return prisma.restaurant.findUnique({
      where: { id },
      select: {
        ...restaurantSelectFields,
        ownerId: true,
        categories: {
          select: {
            ...categorySelectFields,
            items: {
              select: menuItemSelectFields,
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  findBySlug: (slug: string) => {
    return prisma.restaurant.findUnique({
      where: { slug },
      select: {
        ...restaurantSelectFields,
        categories: {
          where: { isActive: true },
          select: {
            ...categorySelectFields,
            items: {
              where: { isAvailable: true },
              select: menuItemSelectFields,
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  findByIdSimple: (id: string) => {
    return prisma.restaurant.findUnique({
      where: { id },
      select: { ...restaurantSelectFields, ownerId: true },
    });
  },

  slugExists: (slug: string, excludeId?: string) => {
    return prisma.restaurant.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
  },

  create: (ownerId: string, name: string, slug: string) => {
    return prisma.restaurant.create({
      data: { ownerId, name, slug },
      select: restaurantSelectFields,
    });
  },

  update: (id: string, data: UpdateRestaurantRequest) => {
    return prisma.restaurant.update({
      where: { id },
      data,
      select: restaurantSelectFields,
    });
  },

  updateQrCode: (id: string, qrCodeUrl: string) => {
    return prisma.restaurant.update({
      where: { id },
      data: { qrCodeUrl },
      select: restaurantSelectFields,
    });
  },

  delete: (id: string) => {
    return prisma.restaurant.delete({
      where: { id },
    });
  },

  getOwnerStats: async (ownerId: string) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [restaurantCount, categoryCount, menuItemCount, qrScanCount] = await Promise.all([
      prisma.restaurant.count({ where: { ownerId } }),
      prisma.category.count({ where: { restaurant: { ownerId } } }),
      prisma.menuItem.count({ where: { category: { restaurant: { ownerId } } } }),
      prisma.qRScan.count({
        where: {
          restaurant: { ownerId },
          scannedAt: { gte: firstDayOfMonth },
        },
      }),
    ]);

    return {
      restaurants: restaurantCount,
      categories: categoryCount,
      menuItems: menuItemCount,
      qrScans: qrScanCount,
    };
  },

  trackQrScan: (restaurantId: string, ipAddress?: string, userAgent?: string) => {
    return prisma.qRScan.create({
      data: {
        restaurantId,
        ipAddress,
        userAgent,
      },
    });
  },
};
