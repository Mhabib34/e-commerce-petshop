import { prisma } from "../../config/prisma.ts";
import type { CreateProductBody, UpdateProductBody, ProductQuery } from "./product.types.ts";

export const productRepository = {
  async findAll(query: ProductQuery) {
    const { search, categoryId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(categoryId && { categoryId }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });
  },

  async create(data: CreateProductBody, imageUrl?: string) {
    const { variants, ...productData } = data;
    return prisma.product.create({
      data: {
        ...productData,
        price: productData.price,
        imageUrl: imageUrl ?? null,
        variants: variants?.length
          ? { create: variants }
          : undefined,
      },
      include: { category: true, variants: true },
    });
  },

  async update(id: string, data: UpdateProductBody, imageUrl?: string) {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: { category: true, variants: true },
    });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};