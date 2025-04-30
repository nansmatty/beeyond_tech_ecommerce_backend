import express from "express";
import { authorize, isAuthenticated } from "../middlewares/authMiddleware";
import {
  acceptOrder,
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderControllers";

const router = express.Router();

router.post(
  "/create-order",
  isAuthenticated,
  authorize("customer"),
  createOrder,
);
router.get("/get-all", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrder);
router.put(
  "/:orderId/accept",
  isAuthenticated,
  authorize("delivery"),
  acceptOrder,
);
router.put(
  "/:orderId/status",
  isAuthenticated,
  authorize("delivery"),
  updateOrderStatus,
);

export default router;
