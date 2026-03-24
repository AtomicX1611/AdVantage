import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/mongo.config.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "fs";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import authRouter from "./src/routes/auth.router.js";
import userRouter from "./src/routes/user.router.js";
// import sellerRouter from "./src/routes/seller.router.js";
import adminRouter from "./src/routes/admin.router.js";
import anyoneRouter from "./src/routes/anyone.router.js";
import { chatRouter } from "./src/routes/chat.routes.js";
import { Server } from "socket.io";
import { socketActions } from "./src/controllers/socket.contoller.js";
import { managerRouter } from "./src/routes/manager.router.js";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { rateLimit } from 'express-rate-limit'

// import { router } from "./src/routes/payment.router.js";
// import { seedData } from "./data.js";
import helmet from "helmet";

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
await connectDB();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for Auth, User, Manager, Admin, and Chat services',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Ensure this points to the files where your @swagger comments live
  apis: ['./src/routes/*.js', './src/routes/**/*.js', './app.js'], 
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// Middleware setups
const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogStream = createStream("access.log", {
  interval: "1d", 
  path: logDirectory,
  maxFiles: 14,
  size: "10M",
});

export const errorLogStream = createStream("error.log", {
  interval: "1d",
  path: logDirectory,
  maxFiles: 30,
  size: "10M",
});

// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	limit: 100,
// 	standardHeaders: 'draft-8',
// 	legacyHeaders: false,
// 	ipv6Subnet: 56,
// })

// app.use(limiter);
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev")); //morgan logger  (app level)
// app.use(helmet());

// body Parsing middleware
app.use(cookieParser()); // Cookie parsing middleware

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:3001",
    "http://localhost:3001"
  ],
  credentials: true
}));

app.use(express.json({ limit: "500mb" })); //(app level)
app.use(express.urlencoded({ extended: true, limit: "500mb" })); //(app level)

app.use("/uploads", express.static(path.join("./", "uploads"))); //(app level)

// Serve bulkUpload.html at /bulkUpload (same-origin, no CORS issues)
app.get("/bulkUpload", (req, res) => {
  res.sendFile(path.resolve("bulkUpload.html"));
});

// ================== This should be removed later ==================

// Proxy endpoint to download external images/invoices (avoids browser CORS restrictions)
app.get("/proxy-download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url query param required" });
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
    });
    if (!response.ok) return res.status(response.status).json({ error: `Failed to fetch: ${response.statusText}` });
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= Till Here ===============================================

app.use("/auth", authRouter);
app.use("/user", userRouter);
// app.use("/seller",sellerRouter);

app.use('/manager', managerRouter);
app.use("/admin", adminRouter);
app.use("/anyone", anyoneRouter);
app.use("/chat", chatRouter);

//need to remove this later
app.get('/shutdown', (req, res) => {
  res.send('Server is shutting down...');
  server.close(() => {
    console.log('Server successfully closed.');
    process.exit(0);
  });
});

app.use(errorMiddleware);

const server = app.listen(process.env.PORT, () => {
  // seedData();
  console.log("Server listening on http://localhost:" + process.env.PORT);
});

export const io = new Server(server, {
  cors: {
    origin:"http://localhost:5173",
    methods:['GET','POST'],
    credentials:true
  }
});

io.on("connection", socketActions);
