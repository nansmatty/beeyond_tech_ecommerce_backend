import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

interface CustomError extends Error {
  statusCode?: number;
  keyValue?: Record<string, any>;
  path?: string;
}

export const ErrorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Ensure err is of type CustomError
  if (err instanceof Error) {
    const error: CustomError = err;
    error.statusCode = error.statusCode || 500;
    error.message = error.message || "Internal Server Error";

    // MongoDB CastError
    if (error.name === "CastError" && error.path) {
      const message = `Resource not found. Invalid: ${error.path}`;
      err = new ErrorHandler(message, 400);
    }

    // MongoDB Duplicate Key Error
    if ((error as any).code === 11000 && error.keyValue) {
      const message = `Duplicate ${Object.keys(error.keyValue).join(", ")} entered.`;
      err = new ErrorHandler(message, 400);
    }

    // Invalid JWT Token
    if (error.name === "JsonWebTokenError") {
      const message = `Invalid Token`;
      err = new ErrorHandler(message, 400);
    }

    // Expired JWT Token
    if (error.name === "TokenExpiredError") {
      const message = `Token Expired`;
      err = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  } else {
    // If the error is not an instance of Error, send a generic internal server error
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
