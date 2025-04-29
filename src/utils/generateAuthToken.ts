import { Response } from "express";
import { Config } from "../config";
import { IUser } from "../models/UserModel";

export interface ITokenOptions {
	httpOnly: boolean;
	sameSite: "lax" | "strict" | "none" | undefined;
	secure?: boolean;
	expires?: Date;
	maxAge?: number;
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
	const accessToken = user.getSignedJwtToken();

	const accessTokenExpire = parseInt(Config.ACCESS_TOKEN_EXPIRY || "24", 10);

	const accessTokenOptions: ITokenOptions = {
		expires: new Date(Date.now() + accessTokenExpire * 1000),
		maxAge: accessTokenExpire * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: "none",
	};

	if (Config.NODE_ENV === "production") {
		accessTokenOptions.secure = true;
	}

	res
		.status(statusCode)
		.cookie("access_token", accessToken, accessTokenOptions)
		.json({
			success: true,
			user: {
				name: user.name,
				email: user.email,
			},
		});
};
