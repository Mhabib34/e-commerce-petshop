import { categoryRepository } from "./category.repository.ts";
import { NotFoundError } from "../../errors/NotFoundError.ts";
import { ValidationError } from "../../errors/ValidationError.ts";
import type { CreateCategoryBody, UpdateCategoryBody } from "./category.types.ts";

export const categoryService = {
  async getAll() {
    return categoryRepository.findAll();
  },

  async create(body: CreateCategoryBody) {
    const existing = await categoryRepository.findBySlug(body.slug);
    if (existing) {
      throw new ValidationError("Slug already in use");
    }
    return categoryRepository.create(body);
  },

  async update(id: string, body: UpdateCategoryBody) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError("Category not found");

    if (body.slug && body.slug !== category.slug) {
      const existing = await categoryRepository.findBySlug(body.slug);
      if (existing) throw new ValidationError("Slug already in use");
    }

    return categoryRepository.update(id, body);
  },

  async delete(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError("Category not found");
    await categoryRepository.delete(id);
  },
};