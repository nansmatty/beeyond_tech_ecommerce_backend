import express, { Request, Response } from "express";
// import http from "http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
// import { Server as SocketServer } from "socket.io";
import { ErrorMiddleware } from "./middlewares/errorMiddleware";
import userRoutes from "./routes/userRoutes";

const app = express();
// const server = http.createServer(app);
// const io = new SocketServer(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
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

app.use(ErrorMiddleware);

export default app;
