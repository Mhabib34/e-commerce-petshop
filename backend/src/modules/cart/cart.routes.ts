import { Router } from "express";
import { cartController } from "./cart.controller.ts";
import { authenticate } from "../../middlewares/authenticate.ts";
import { authorize } from "../../middlewares/authorize.ts";

export const cartRoutes = Router();

cartRoutes.use(authenticate, authorize("CUSTOMER"));

cartRoutes.get("/", cartController.getCart);
cartRoutes.post("/", cartController.addItem);
cartRoutes.put("/:itemId", cartController.updateItem);
cartRoutes.delete("/:itemId", cartController.deleteItem);