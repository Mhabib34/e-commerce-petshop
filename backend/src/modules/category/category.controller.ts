import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { categoryService } from "./category.service.ts";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

const updateSchema = createSchema.partial();

export const categoryController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await categoryService.getAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const data = await categoryService.create(body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateSchema.parse(req.body);
      const id = req.params["id"] as string;
      const data = await categoryService.update(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      await categoryService.delete(id);
      res.json({ success: true, message: "Category deleted" });
    } catch (err) {
      next(err);
    }
  },
};