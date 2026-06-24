import { prisma } from "../../config/prisma.ts";
import type { RegisterBody } from "./auth.types.ts";

export const authRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  },

  async create(data: RegisterBody & { password: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone ?? null,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  },
};