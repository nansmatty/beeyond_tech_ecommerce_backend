import { config } from "dotenv";

config();

const { PORT, NODE_ENV, JWT_SECRET, MONGODB_URI, ACCESS_TOKEN_EXPIRY } = process.env;

export const Config = {
	PORT,
	NODE_ENV,
	JWT_SECRET,
	MONGODB_URI,
	ACCESS_TOKEN_EXPIRY,
};
