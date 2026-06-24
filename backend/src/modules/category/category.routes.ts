import { Router } from "express";
import { categoryController } from "./category.controller.ts";
import { authenticate } from "../../middlewares/authenticate.ts";
import { authorize } from "../../middlewares/authorize.ts";

export const categoryRoutes = Router();

categoryRoutes.get("/", categoryController.getAll);
categoryRoutes.post("/", authenticate, authorize("ADMIN"), categoryController.create);
categoryRoutes.put("/:id", authenticate, authorize("ADMIN"), categoryController.update);
categoryRoutes.delete("/:id", authenticate, authorize("ADMIN"), categoryController.delete);