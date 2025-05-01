import { NextFunction, Response } from "express";
import CatchAsyncError from "../utils/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import logger from "../config/logger";
import Product from "../models/ProductModel";
import Order from "../models/OrderModel";
import { AuthRequest } from "../middlewares/authMiddleware";

export const createOrder = CatchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { items, deliveryAddress } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return next(
          new ErrorHandler("Order must contain at least one item", 400),
        );
      }

      if (
        !(
          deliveryAddress ||
          deliveryAddress.street ||
          deliveryAddress.city ||
          deliveryAddress.state ||
          deliveryAddress.pincode
        )
      ) {
        return next(
          new ErrorHandler("Complete delivery address required", 400),
        );
      }

      // Calculate total price
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findById(item.product);

        if (!product || !product.inStock) {
          return next(
            new ErrorHandler(
              "One or more products are unavailable or out of stock.",
              400,
            ),
          );
        }

        totalAmount += item.quantity * product.price;
      }

      const newOrder = await Order.create({
        customer: userId,
        items,
        totalAmount,
        status: "pending",
        deliveryAddress,
      });

      if (newOrder) {
        return res.status(201).json({
          success: true,
          message: "Order place successfully",
          order: newOrder,
        });
      } else {
        return next(
          new ErrorHandler(
            "There is problem while placing an order. Please try after sometime",
            400,
          ),
        );
      }
    } catch (error) {
      logger.error("Create Order Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const getOrders = CatchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;

      if (role === "customer") {
        const orders = await Order.find({ customer: req.user?.id });

        if (!orders || orders.length === 0) {
          return next(new ErrorHandler("No orders found", 404));
        }

        return res.status(200).json({
          success: true,
          orders,
        });
      }

      const orders = await Order.find()
        .populate("customer")
        .populate("items.product");

      if (!orders || orders.length === 0) {
        return next(new ErrorHandler("No orders found", 404));
      }

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      logger.error("Get Orders Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const getOrder = CatchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("No order found", 404));
      }

      return res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      logger.error("Get Order Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const updateOrderStatus = CatchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const user = req.user;

    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return next(new ErrorHandler("No order found", 404));
      }

      if (!["admin", "delivery"].includes(user?.role ?? "")) {
        return next(new ErrorHandler("Unauthorized", 403));
      }

      order.status = status;
      await order.save();

      req.app.get("io").to(`order:${orderId}`).emit("order:statusUpdate", {
        orderId,
        status,
        updatedAt: new Date(),
      });

      req.app.get("io").to(`admin`).emit("order:statusUpdate", {
        orderId,
        status,
        updatedAt: new Date(),
      });

      return res.json({ message: "Order status updated", order });
    } catch (error) {
      logger.error("Update Order Status Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const acceptOrder = CatchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (role !== "delivery") {
      return next(
        new ErrorHandler("Only delivery partners can accept orders", 403),
      );
    }
    try {
      const order = await Order.findOne({ _id: orderId });

      if (!order) return res.status(404).json({ message: "Order not found" });

      if (order.deliveryPartner) {
        return next(
          new ErrorHandler("Order already accepted by another partner", 400),
        );
      }

      order.status = "accepted";
      order.deliveryPartner = userId;
      await order.save();

      req.app.get("io").to(`order:${orderId}`).emit("order:accept", {
        orderId,
        deliveryPartner: userId,
        status: "accepted",
        updatedAt: new Date(),
      });

      req.app.get("io").to(`admin`).emit("order:accept", {
        orderId,
        deliveryPartner: userId,
        status: "accepted",
        updatedAt: new Date(),
      });

      return res.status(202).json({ message: "Order accepted successfully" });
    } catch (error) {
      logger.error("Accept Order Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const getAvailableOrders = CatchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await Order.find({
        status: "pending",
        deliveryPartner: { $exists: false },
      });

      if (!orders || orders.length === 0) {
        return next(new ErrorHandler("No orders available", 404));
      }

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      logger.error("Get Available Orders Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const getMyDeliveries = CatchAsyncError(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const deliveryPartnerId = req.user?.id;

      const orders = await Order.find({ deliveryPartner: deliveryPartnerId });

      if (!orders || orders.length === 0) {
        return next(new ErrorHandler("No orders available", 404));
      }

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      logger.error("Get My Deliveries Orders Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);
