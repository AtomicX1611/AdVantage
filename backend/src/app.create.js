import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import morgan from "morgan";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import authRouter from "./routes/auth.router.js";
import userRouter from "./routes/user.router.js";
import adminRouter from "./routes/admin.router.js";
import anyoneRouter from "./routes/anyone.router.js";
import { chatRouter } from "./routes/chat.router.js";
import { chatbotRouter } from "./routes/chatbot.router.js";
import { managerRouter } from "./routes/manager.router.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { accessLogStream } from "./config/logger.config.js";

import './config/Redis.config.js';

export function createApp() {
    const app = express();

    const swaggerPath = path.resolve("./swagger.json");
    if (fs.existsSync(swaggerPath)) {
        const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    app.use(morgan("combined", { stream: accessLogStream }));
    app.use(morgan("dev"));
    app.use(helmet());

    app.use(cookieParser());

    app.use(
        cors({
            origin: [
                "http://localhost:5173",
                "http://127.0.0.1:3001",
                "http://localhost:3001",
            ],
            credentials: true,
        })
    );

    app.use(express.json({ limit: "500mb" }));
    app.use(express.urlencoded({ extended: true, limit: "500mb" }));

    app.use("/uploads", express.static(path.join("./", "uploads")));

    app.get("/bulkUpload", (req, res) => {
        res.sendFile(path.resolve("bulkUpload.html"));
    });

    app.get("/proxy-download", async (req, res) => {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: "url query param required" });

        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Accept: "*/*",
                },
            });

            if (!response.ok) {
                return res
                    .status(response.status)
                    .json({ error: "Failed to fetch: " + response.statusText });
            }

            const contentType = response.headers.get("content-type");
            if (contentType) res.setHeader("Content-Type", contentType);

            const buffer = Buffer.from(await response.arrayBuffer());
            res.send(buffer);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/manager", managerRouter);
    app.use("/admin", adminRouter);
    app.use("/anyone", anyoneRouter);
    app.use("/chatbot", chatbotRouter);
    app.use("/chat", chatRouter);

    app.use(errorMiddleware);

    return app;
}