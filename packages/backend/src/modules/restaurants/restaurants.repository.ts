import { prisma } from "@database/client";

export class RestaurantsRepository {
  async findAll(ownerId: string) {
    return prisma.restaurant.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: { orderBy: { createdAt: "desc" } },
        categories: { orderBy: { sortOrder: "asc" } },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.restaurant.findUnique({
      where: { slug },
      select: {
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
        menus: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            isActive: true,
            menuItems: {
              where: { isAvailable: true },
              orderBy: { createdAt: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                isAvailable: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async checkSlugExists(slug: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!restaurant;
  }

  async create(ownerId: string, name: string, slug: string) {
    return prisma.restaurant.create({ data: { ownerId, name, slug } });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      qrCodeUrl?: string;
      location?: string;
      contactEmail?: string;
      contactPhone?: string;
      primaryColor?: string;
      backgroundColor?: string;
      logoUrl?: string;
      headerImageUrl?: string;
    },
  ) {
    return prisma.restaurant.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.restaurant.delete({ where: { id } });
  }

  async checkOwnership(id: string, ownerId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    return restaurant?.ownerId === ownerId;
  }

  async getOwnerStats(ownerId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [restaurantCount, menuCount, menuItemCount, qrScanCount] = await Promise.all([
      prisma.restaurant.count({ where: { ownerId } }),
      prisma.menu.count({
        where: { restaurant: { ownerId } },
      }),
      prisma.menuItem.count({
        where: { menu: { restaurant: { ownerId } } },
      }),
      prisma.qRScan.count({
        where: {
          restaurant: { ownerId },
          scannedAt: { gte: firstDayOfMonth },
        },
      }),
    ]);

    return {
      restaurants: restaurantCount,
      menus: menuCount,
      menuItems: menuItemCount,
      qrScans: qrScanCount,
    };
  }

  async trackQRScan(restaurantId: string, ipAddress?: string, userAgent?: string) {
    return prisma.qRScan.create({
      data: {
        restaurantId,
        ipAddress,
        userAgent,
      },
    });
  }
}
