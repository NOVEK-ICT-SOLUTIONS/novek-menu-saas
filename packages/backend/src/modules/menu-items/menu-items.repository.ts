import { prisma } from "@database/client";
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from "@modules/menu-items/menu-items.types";

export class MenuItemsRepository {
  async findAllByMenu(menuId: string) {
    return prisma.menuItem.findMany({
      where: { menuId },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        menu: { select: { restaurantId: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.menuItem.findUnique({
      where: { id },
      include: { category: true, menu: true },
    });
  }

  async create(menuId: string, data: CreateMenuItemRequest) {
    return prisma.menuItem.create({
      data: {
        menuId,
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable ?? true,
      },
      include: { category: true },
    });
  }

  async update(id: string, data: UpdateMenuItemRequest) {
    return prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    return prisma.menuItem.delete({ where: { id } });
  }
}
