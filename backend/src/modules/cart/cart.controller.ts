import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { cartService } from "./cart.service.ts";

const addSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const updateSchema = z.object({
  quantity: z.number().int().positive(),
});

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cartService.getCart(req.user!.userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const body = addSchema.parse(req.body);
      const data = await cartService.addItem(req.user!.userId, body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId = req.params["itemId"] as string;
      const body = updateSchema.parse(req.body);
      const data = await cartService.updateItem(req.user!.userId, itemId, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId = req.params["itemId"] as string;
      await cartService.deleteItem(req.user!.userId, itemId);
      res.json({ success: true, message: "Item removed from cart" });
    } catch (err) {
      next(err);
    }
  },
};