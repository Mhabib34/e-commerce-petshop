import { Router } from "express";
import { dashboardController } from "./dashboard.controller.ts";
import { orderController } from "../order/order.controller.ts";
import { authenticate } from "../../middlewares/authenticate.ts";
import { authorize } from "../../middlewares/authorize.ts";

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate, authorize("ADMIN"));

dashboardRoutes.get("/dashboard", dashboardController.getDashboard);
dashboardRoutes.get("/orders", dashboardController.getAllOrders);
dashboardRoutes.patch("/orders/:id/status", dashboardController.updateOrderStatus);