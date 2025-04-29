import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import logger from "../config/logger";

interface CustomError extends Error {
	statusCode?: number;
	keyValue?: Record<string, any>;
	path?: string;
}

export const ErrorMiddleware = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	// Ensure err is of type CustomError
	if (err instanceof Error) {
		const error: CustomError = err;
		error.statusCode = error.statusCode || 500;
		error.message = error.message || "Internal Server Error";

		// MongoDB CastError
		if (error.name === "CastError" && error.path) {
			error.message = `Resource not found. Invalid: ${error.path}`;
			error.statusCode = 400;
		}

		// MongoDB Duplicate Key Error
		if ((error as any).code === 11000 && error.keyValue) {
			error.message = `Duplicate ${Object.keys(error.keyValue).join(", ")} entered.`;
			error.statusCode = 400;
		}

		// Invalid JWT Token
		if (error.name === "JsonWebTokenError") {
			error.message = `Invalid Token`;
			error.statusCode = 400;
		}

		// Expired JWT Token
		if (error.name === "TokenExpiredError") {
			error.message = `Token Expired`;
			error.statusCode = 401;
		}

		// Log error with Winston
		logger.error(`${error.statusCode} - ${error.message}`, {
			stack: error.stack,
		});

		res.status(error.statusCode).json({
			success: false,
			message: error.message,
		});
	} else {
		logger.error("Unknown error", { err });
		// If the error is not an instance of Error, send a generic internal server error
		res.status(500).json({
			success: false,
			message: "Internal Server Error",
		});
	}
};
