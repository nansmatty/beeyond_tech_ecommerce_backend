import app from "./app";
import { Config } from "./config";
import connectDB from "./config/db";

const startServer = () => {
	const PORT = Config.PORT || 5000;

	connectDB();

	try {
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port -- ${PORT}`);
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

startServer();
