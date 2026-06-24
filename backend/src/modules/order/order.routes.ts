import { Router } from "express";
import { orderController } from "./order.controller.ts";
import { authenticate } from "../../middlewares/authenticate.ts";
import { authorize } from "../../middlewares/authorize.ts";

export const orderRoutes = Router();

// Customer routes
orderRoutes.get(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  orderController.getMyOrders
);
orderRoutes.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  orderController.checkout
);
orderRoutes.get(
  "/:id",
  authenticate,
  authorize("CUSTOMER"),
  orderController.getMyOrderById
);