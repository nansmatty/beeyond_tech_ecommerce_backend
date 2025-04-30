import express from "express";
import {
  createProduct,
  getProduct,
  getProducts,
} from "../controllers/productControllers";
import { authorize, isAuthenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/get-all", getProducts);
router.post("/create", isAuthenticated, authorize("admin"), createProduct);
router.get("/:id", getProduct);

export default router;
