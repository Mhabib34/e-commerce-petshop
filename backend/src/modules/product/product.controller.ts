import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { productService } from "./product.service.ts";

const variantSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().uuid(),
  variants: z
    .preprocess(
      (val) => (typeof val === "string" ? JSON.parse(val) : val),
      z.array(variantSchema).optional()
    )
    .optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
});

export const productController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, page, limit } = req.query as Record<string, string>;
      const { items, meta } = await productService.getAll({
        search,
        categoryId,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: items, meta });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await productService.getById(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;
      const data = await productService.create(body, imageUrl);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateSchema.parse(req.body);
      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;
      const data = await productService.update(id, body, imageUrl);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      await productService.delete(id);
      res.json({ success: true, message: "Product deleted" });
    } catch (err) {
      next(err);
    }
  },
};