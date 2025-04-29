import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
	level: "info",
	defaultMeta: {
		serviceName: "Beeyond-Tech-Ecommerce",
	},
	transports: [
		new winston.transports.File({
			level: "info",
			dirname: "logs",
			filename: "combined.log",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
				winston.format.colorize()
			),
			silent: true,
		}),
		new winston.transports.File({
			level: "error",
			dirname: "logs",
			filename: "error.log",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
				winston.format.colorize()
			),
			silent: true,
		}),

		new winston.transports.Console({
			level: "info",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
				winston.format.colorize()
			),
			silent: Config.NODE_ENV !== "development",
		}),
	],
});

export default logger;
