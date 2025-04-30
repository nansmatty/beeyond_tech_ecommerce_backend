import { Server, Socket } from "socket.io";
import { IDecodedToken } from "../middlewares/authMiddleware";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import logger from "../config/logger";

interface SocketWithUser extends Socket {
  user?: IDecodedToken;
}

export const setupSocketHandlers = (io: Server) => {
  //Middleware: Authenticate socket with JWT from cookies
  io.use((socket: SocketWithUser, next) => {
    try {
      const cookiesHeader = socket.handshake.headers.cookie;
      if (!cookiesHeader) return next(new Error("No cookies found in headers"));

      const cookies = cookie.parse(cookiesHeader);
      const token = cookies.access_token;

      if (!token || typeof token !== "string") {
        return next(new Error("Access token not found"));
      }

      const decoded = jwt.verify(
        token,
        Config.JWT_SECRET as string,
      ) as IDecodedToken;
      socket.user = decoded;

      next();
    } catch (error) {
      logger.error("Socket Authentication Error:", error);
      return next(new Error("Authentication Error"));
    }
  });

  //Socket Connection

  io.on("connection", (socket: SocketWithUser) => {
    if (!socket.user) return;

    logger.info(
      `Socket connected: ${socket.id} | User: ${socket.user.id} | Role: ${socket.user.role}`,
    );

    //Join per user room
    socket.join(`user:${socket.user.id}`);

    // Join role-based room
    switch (socket.user.role) {
      case "admin":
        socket.join("admin");
        break;
      case "delivery":
        socket.join("delivery-partners");
        break;
    }

    // Join an order-specific room for tracking

    socket.on("join:order", (orderId: string) => {
      socket.join(`order:${orderId}`);
      logger.info(`User ${socket.user?.id} joined order room ${orderId}`);
    });

    socket.on("leave:order", (orderId: string) => {
      socket.leave(`order:${orderId}`);
      logger.info(`User ${socket.user?.id} left order room ${orderId}`);
    });

    //Delivery partner/admin updates order status
    socket.on("order:statusUpdate", async ({ orderId, status }) => {
      if (!socket.user || !["delivery", "admin"].includes(socket.user.role)) {
        socket.emit("error", {
          message: "Unauthorized to update order status",
        });
        return;
      }

      io.to(`order:${orderId}`).emit("order:statusUpdated", {
        orderId,
        status,
        updatedAt: new Date(),
      });

      io.to("admin").emit("order:statusUpdated", {
        orderId,
        status,
        updatedAt: new Date(),
      });

      logger.info(
        `Order ${orderId} status updated to ${status} by user ${socket.user.id}`,
      );
    });

    // Delivery partner accepts an order

    socket.on("order:accept", async ({ orderId }) => {
      if (!socket.user || socket.user.role !== "delivery") {
        socket.emit("error", { message: "Unauthorized to accept order" });
        return;
      }

      io.to(`order:${orderId}`).emit("order:statusUpdated", {
        orderId,
        deliveryPartnerId: socket.user.id,
        status: "accepted",
        updatedAt: new Date(),
      });

      io.to("admin").emit("order:statusUpdated", {
        orderId,
        deliveryPartnerId: socket.user.id,
        status: "accepted",
        updatedAt: new Date(),
      });

      logger.info(
        `Order ${orderId} accepted by delivery partner ${socket.user.id}`,
      );
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
