import { Router } from "express";
import { productController } from "./product.controller.ts";
import { authenticate } from "../../middlewares/authenticate.ts";
import { authorize } from "../../middlewares/authorize.ts";
import { upload } from "../../middlewares/upload.ts";

export const productRoutes = Router();

productRoutes.get("/", productController.getAll);
productRoutes.get("/:id", productController.getById);
productRoutes.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.single("image"),
  productController.create
);
productRoutes.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  upload.single("image"),
  productController.update
);
productRoutes.delete("/:id", authenticate, authorize("ADMIN"), productController.delete);