import { CorsOptions } from "cors";
// import { Config } from ".";
// import ErrorHandler from "../utils/errorHandler";

// const allowedOrigins = "127.0.0.1:3000";

const corsOptions: CorsOptions = {
	credentials: true,
	// origin: (originUrl, callback) => {
	// 	if (allowedOrigins && allowedOrigins.indexOf(originUrl as string) !== -1) {
	// 		callback(null, true);
	// 	} else {
	// 		const corsError = new ErrorHandler("Not allowed by CORS", 403);
	// 		callback(corsError);
	// 	}
	// },
};

export default corsOptions;
