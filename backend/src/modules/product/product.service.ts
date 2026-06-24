import { productRepository } from "./product.repository.ts";
import { categoryRepository } from "../category/category.repository.ts";
import { NotFoundError } from "../../errors/NotFoundError.ts";
import type { CreateProductBody, UpdateProductBody, ProductQuery } from "./product.types.ts";
import fs from "fs";
import path from "path";

export const productService = {
  async getAll(query: ProductQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await productRepository.findAll({ ...query, page, limit });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  },

  async create(body: CreateProductBody, imageUrl?: string) {
    const category = await categoryRepository.findById(body.categoryId);
    if (!category) throw new NotFoundError("Category not found");
    return productRepository.create(body, imageUrl);
  },

  async update(id: string, body: UpdateProductBody, imageUrl?: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");

    if (body.categoryId) {
      const category = await categoryRepository.findById(body.categoryId);
      if (!category) throw new NotFoundError("Category not found");
    }

    // Hapus gambar lama jika ada gambar baru
    if (imageUrl && product.imageUrl) {
      const oldPath = path.resolve("uploads", path.basename(product.imageUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return productRepository.update(id, body, imageUrl);
  },

  async delete(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");

    if (product.imageUrl) {
      const imgPath = path.resolve("uploads", path.basename(product.imageUrl));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await productRepository.delete(id);
  },
};