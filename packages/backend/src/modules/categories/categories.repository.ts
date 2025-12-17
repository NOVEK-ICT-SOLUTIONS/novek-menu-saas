import { prisma } from "../../core/database/prisma.client.ts";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "./categories.types.ts";

const categorySelectFields = {
  id: true,
  restaurantId: true,
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const menuItemSelectFields = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  isAvailable: true,
  sortOrder: true,
} as const;

export const categoriesRepository = {
  findAllByRestaurant: (restaurantId: string) => {
    return prisma.category.findMany({
      where: { restaurantId },
      select: {
        ...categorySelectFields,
        items: {
          select: menuItemSelectFields,
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  },

  findById: (id: string) => {
    return prisma.category.findUnique({
      where: { id },
      select: {
        ...categorySelectFields,
        items: {
          select: menuItemSelectFields,
          orderBy: { sortOrder: "asc" },
        },
        restaurant: {
          select: { ownerId: true },
        },
      },
    });
  },

  findByIdSimple: (id: string) => {
    return prisma.category.findUnique({
      where: { id },
      select: {
        ...categorySelectFields,
        restaurant: {
          select: { ownerId: true },
        },
      },
    });
  },

  nameExistsInRestaurant: (restaurantId: string, name: string, excludeId?: string) => {
    return prisma.category.findFirst({
      where: {
        restaurantId,
        name,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
  },

  create: (data: CreateCategoryRequest) => {
    return prisma.category.create({
      data: {
        restaurantId: data.restaurantId,
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder ?? 0,
      },
      select: categorySelectFields,
    });
  },

  update: (id: string, data: UpdateCategoryRequest) => {
    return prisma.category.update({
      where: { id },
      data,
      select: categorySelectFields,
    });
  },

  delete: (id: string) => {
    return prisma.category.delete({ where: { id } });
  },

  getRestaurantOwnerId: (restaurantId: string) => {
    return prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { ownerId: true },
    });
  },
};
