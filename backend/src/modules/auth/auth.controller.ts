import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "./auth.service.ts";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerSchema.parse(req.body);
      const data = await authService.register(body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = loginSchema.parse(req.body);
      const data = await authService.login(body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },
};