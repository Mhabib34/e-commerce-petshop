import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { dashboardService } from "./dashboard.service.ts";

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "DIPROSES", "SELESAI"]),
});

export const dashboardController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query["period"] as string) ?? "7d";
      const data = await dashboardService.getDashboard(period);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query as Record<string, string>;
      const { items, meta } = await dashboardService.getAllOrders({
        status: status as "PENDING" | "DIPROSES" | "SELESAI" | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: items, meta });
    } catch (err) {
      next(err);
    }
  },

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { status } = updateStatusSchema.parse(req.body);
      const data = await dashboardService.updateOrderStatus(id, status);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};