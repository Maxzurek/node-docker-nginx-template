import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";

dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev" });
const app = express();

const configMiddleware = () => {
    // TODO Add necessary domains to the whitelist array
    const whitelist = ["http://127.0.0.1:5173", "https://www.thunderclient.com"];

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || (origin && whitelist.includes(origin))) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
        })
    );
    app.use(helmet());
    // parse requests of content-type - application/json
    app.use(express.json());
    // parse requests of content-type - application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: true }));
};

const connectMongoDb = () => {
    mongoose.set("strictQuery", false);
    mongoose
        .connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`,
            {
                retryWrites: true,
            }
        )
        .then((result) => {
            console.log(`Connected successfully to database: ${result.connection.name}`);
        })
        .catch((err) => {
            console.error("Connection error", err);
            process.exit();
        });
};

const configRoutes = () => {
    // Auth
    app.use("/auth", authRoutes);
};

configMiddleware();
connectMongoDb();
configRoutes();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
