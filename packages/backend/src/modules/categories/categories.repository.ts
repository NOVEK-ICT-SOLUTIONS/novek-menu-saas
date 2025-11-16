import { prisma } from "@database/client";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@modules/categories/categories.types";

export class CategoriesRepository {
  async findAllByRestaurant(restaurantId: string) {
    return prisma.category.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: "asc" },
      include: { menuItems: true },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: { menuItems: true },
    });
  }

  async create(restaurantId: string, data: CreateCategoryRequest) {
    return prisma.category.create({
      data: {
        restaurantId,
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, data: UpdateCategoryRequest) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}
