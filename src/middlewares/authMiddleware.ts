import { NextFunction, Request, Response } from "express";
import CatchAsyncError from "../utils/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import User, { IUser } from "../models/UserModel";
import logger from "../config/logger";

export interface IDecodedToken {
	id: string;
	role: string;
}

export interface AuthRequest extends Request {
	user?: IDecodedToken | IUser;
}

export const isAuthenticated = CatchAsyncError(
	async (req: AuthRequest, _res: Response, next: NextFunction) => {
		try {
			const access_token =
				req.cookies.access_token || req.header("Authorization")?.replace("Bearer ", "");

			if (!access_token || typeof access_token !== "string") {
				return next(new ErrorHandler("access_token not found", 401));
			}

			const decoded = jwt.verify(access_token, Config.JWT_SECRET as string) as IDecodedToken;

			if (!decoded) {
				return next(new ErrorHandler("Not Authorized", 401));
			}

			const user = await User.findById(decoded.id).select("-password");

			if (!user) {
				return next(new ErrorHandler("User not found.", 401));
			}

			req.user = user;

			next();
		} catch (error) {
			logger.error("isAuthenticated middleware: ", error);
			return next(new ErrorHandler("You are not authorized. Please login first!", 401));
		}
	}
);

export const authorize = (...roles: string[]) => {
	return (req: AuthRequest, _res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new ErrorHandler("User not found in request.", 500));
		}

		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorHandler(`Role ${req.user.role} is not authorized to access this route`, 401)
			);
		}

		next();
	};
};
