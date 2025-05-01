import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { ErrorMiddleware } from "./middlewares/errorMiddleware";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import corsOptions from "./config/corsOptions";
import ErrorHandler from "./utils/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());

app.get("/api/health-check", (_req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "API is working",
    });
  } catch (error) {
    console.error(error);
  }
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);

//Fallback route
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new ErrorHandler(`Route  ${req.originalUrl} not found`, 404));
});

app.use(ErrorMiddleware);

export default app;
