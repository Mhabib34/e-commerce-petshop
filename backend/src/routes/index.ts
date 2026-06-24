import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoryRoutes } from "../modules/category/category.routes";


export const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
// router.use("/products", productRoutes);
// router.use("/cart", cartRoutes);
// router.use("/orders", orderRoutes);
// router.use("/admin", dashboardRoutes);