import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/UserModel";
import CatchAsyncError from "../utils/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { sendToken } from "../utils/generateAuthToken";
import { Config } from "../config";

export const register = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, password, role } = req.body;

		if (!(name || email || password)) {
			return next(new ErrorHandler("Please fill all the details", 400));
		}

		const emailEdited = email.trim().toLowerCase();

		const isEmailExist = await User.findOne({ email: emailEdited });

		if (isEmailExist) {
			return next(new ErrorHandler("User with same email or mobile number already exists.", 409));
		}

		const user = await User.create({
			name,
			email,
			password,
			role: role || "customer",
		});

		const createdUser = await User.findById(user._id).select("-password");

		if (!createdUser) {
			return next(new ErrorHandler("Something went wrong while registering the user", 500));
		}

		return res.status(201).json({
			message: "User successfully registered. You can login in!",
		});
	} catch (error) {
		return next(new ErrorHandler("Something went wrong. Please try after sometime.", 500));
	}
});

export const login = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;

		if (!(email || password)) {
			return next(new ErrorHandler("Please enter email and password", 400));
		}

		const emailEdited = email.trim().toLowerCase();

		const user = await User.findOne({ email: emailEdited }).select("password");

		if (!user) {
			return next(new ErrorHandler("User not found", 404));
		}
		const isPasswordValid = await user.isPasswordCorrect(password);

		if (!isPasswordValid) {
			return next(new ErrorHandler("Invalid Credentials", 401));
		}

		const loggedInUser: IUser = await User.findById(user._id).select("-password");

		sendToken(loggedInUser, 200, res);
	} catch (error) {
		return next(new ErrorHandler(`Something went wrong. Please try after sometime.`, 500));
	}
});

export const logout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
	try {
		res
			.clearCookie("access_token", {
				httpOnly: true,
				secure: Config.NODE_ENV === "production" ? true : false,
			})
			.json({ message: "Logout successfully" });
	} catch (error) {
		return next(new ErrorHandler("Something went wrong. Please try after sometime.", 500));
	}
});
