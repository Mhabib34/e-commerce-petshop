import { prisma } from "../../config/prisma.ts";
import type { CreateCategoryBody, UpdateCategoryBody } from "./category.types.ts";

export const categoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  async create(data: CreateCategoryBody) {
    return prisma.category.create({ data });
  },

  async update(id: string, data: UpdateCategoryBody) {
    return prisma.category.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};