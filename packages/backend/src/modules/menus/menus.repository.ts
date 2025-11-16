import { prisma } from "@database/client";

export class MenusRepository {
  async findAllByRestaurant(restaurantId: string) {
    return prisma.menu.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
      include: { menuItems: { orderBy: { createdAt: "desc" } } },
    });
  }

  async findById(id: string) {
    return prisma.menu.findUnique({
      where: { id },
      include: { menuItems: { orderBy: { createdAt: "desc" } } },
    });
  }

  async create(restaurantId: string, name: string, isActive: boolean) {
    return prisma.menu.create({ data: { restaurantId, name, isActive } });
  }

  async update(id: string, data: { name?: string; isActive?: boolean }) {
    return prisma.menu.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.menu.delete({ where: { id } });
  }
}
