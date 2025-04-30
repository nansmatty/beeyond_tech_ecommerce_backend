import { NextFunction, Request, Response } from "express";
import CatchAsyncError from "../utils/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import Product from "../models/ProductModel";
import logger from "../config/logger";

export const getProducts = CatchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await Product.find({ inStock: true });

      if (!products) {
        return next(new ErrorHandler("No products found.", 404));
      }

      return res.status(200).json({ success: true, products });
    } catch (error) {
      logger.error("Get All Products Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const getProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found.", 404));
      }

      return res.status(200).json({ success: true, product });
    } catch (error) {
      logger.error("Get Product Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);

export const createProduct = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, price, image, category, inStock } = req.body;

      if (!(name || description || price || category)) {
        return next(new ErrorHandler("Please fill all the details", 400));
      }

      const product = await Product.create({
        name,
        description,
        price,
        image,
        category,
        inStock,
      });

      if (product) {
        return res
          .status(201)
          .json({ success: true, message: "Product created successfully!" });
      } else {
        return next(
          new ErrorHandler(
            "There is problem while creating product. Please try after sometime",
            400,
          ),
        );
      }
    } catch (error) {
      logger.error("Create Product Error: ", error);
      return next(
        new ErrorHandler(
          "Something went wrong. Please try after sometime.",
          500,
        ),
      );
    }
  },
);
