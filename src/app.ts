import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

export default app;
