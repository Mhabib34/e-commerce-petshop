import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { orderService } from "./order.service.ts";

const createSchema = z.object({
  shippingAddress: z.string().min(1),
  paymentMethod: z.enum(["COD", "DUMMY"]),
  cartItemIds: z.array(z.string().uuid()).optional(),
});

const directCheckoutSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  shippingAddress: z.string().min(1),
  paymentMethod: z.enum(["COD", "DUMMY"]),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "DIPROSES", "SELESAI"]),
});

export const orderController = {
  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query as Record<string, string>;
      const { items, meta } = await orderService.getMyOrders(
        req.user!.userId,
        {
          status: status as "PENDING" | "DIPROSES" | "SELESAI" | undefined,
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        }
      );
      res.json({ success: true, data: items, meta });
    } catch (err) {
      next(err);
    }
  },

  async getMyOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await orderService.getMyOrderById(req.user!.userId, id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const data = await orderService.checkout(req.user!.userId, body);
      res.status(201).json({ success: true, message: "Pesanan berhasil dibuat", data });
    } catch (err) {
      next(err);
    }
  },

  async directCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const body = directCheckoutSchema.parse(req.body);
      const data = await orderService.directCheckout(req.user!.userId, body);
      res.status(201).json({ success: true, message: "Pesanan berhasil dibuat", data });
    } catch (err) {
      next(err);
    }
  },

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query as Record<string, string>;
      const { items, meta } = await orderService.getAllOrders({
        status: status as "PENDING" | "DIPROSES" | "SELESAI" | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: items, meta });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateStatusSchema.parse(req.body);
      const data = await orderService.updateStatus(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};