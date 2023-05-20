import { createLogger, transports, format } from "winston";

export const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    defaultMeta: { service: "user-service" },
    transports: [new transports.File({ filename: "error.log", level: "error" })],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new transports.Console({
            format: format.simple(),
        })
    );
}
