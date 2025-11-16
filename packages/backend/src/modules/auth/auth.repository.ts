import { prisma } from "@database/client";
import type { UserRole } from "@prisma/client";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(email: string, hashedPassword: string, role: UserRole = "OWNER") {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateUser(id: string, data: { password?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
