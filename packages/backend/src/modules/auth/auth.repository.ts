import { prisma } from "../../core/database/prisma.client.ts";
import type { UserRole } from "@prisma/client";

const DEFAULT_USER_ROLE: UserRole = "OWNER";

const userSelectFields = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const authRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById: (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: userSelectFields,
    });
  },

  create: (email: string, hashedPassword: string, role: UserRole = DEFAULT_USER_ROLE) => {
    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
      select: userSelectFields,
    });
  },

  updatePassword: (id: string, hashedPassword: string) => {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: userSelectFields,
    });
  },
};
