import { prisma } from "../../core/database/prisma.client.ts";
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from "./menu-items.types.ts";

const menuItemSelectFields = {
  id: true,
  categoryId: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  isAvailable: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const menuItemsRepository = {
  findAllByCategory: (categoryId: string) => {
    return prisma.menuItem.findMany({
      where: { categoryId },
      select: menuItemSelectFields,
      orderBy: { sortOrder: "asc" },
    });
  },

  findById: (id: string) => {
    return prisma.menuItem.findUnique({
      where: { id },
      select: {
        ...menuItemSelectFields,
        category: {
          select: {
            id: true,
            restaurantId: true,
            restaurant: {
              select: { ownerId: true },
            },
          },
        },
      },
    });
  },

  findByIdSimple: (id: string) => {
    return prisma.menuItem.findUnique({
      where: { id },
      select: {
        ...menuItemSelectFields,
        category: {
          select: {
            restaurant: {
              select: { ownerId: true },
            },
          },
        },
      },
    });
  },

  getCategoryOwnerId: (categoryId: string) => {
    return prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        restaurantId: true,
        restaurant: {
          select: { ownerId: true },
        },
      },
    });
  },

  create: (data: CreateMenuItemRequest) => {
    return prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      select: menuItemSelectFields,
    });
  },

  update: (id: string, data: UpdateMenuItemRequest) => {
    return prisma.menuItem.update({
      where: { id },
      data,
      select: menuItemSelectFields,
    });
  },

  delete: (id: string) => {
    return prisma.menuItem.delete({ where: { id } });
  },
};
