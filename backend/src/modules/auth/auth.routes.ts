import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { authenticate } from "../../middlewares/authenticate.ts";

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authenticate, authController.me);