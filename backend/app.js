import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/mongo.config.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import authRouter from "./src/routes/auth.router.js";
import userRouter from "./src/routes/user.router.js";
// import sellerRouter from "./src/routes/seller.router.js";
import adminRouter from "./src/routes/admin.router.js";
import anyoneRouter from "./src/routes/anyone.router.js";
import { chatRouter } from "./src/routes/chat.routes.js";
import { Server } from "socket.io";
import { socketActions } from "./src/controllers/socket.contoller.js";
import { managerRouter } from "./src/routes/manager.router.js";
import { router } from "./src/routes/payment.router.js";
import { seedData } from "./data.js";

const app = express();
await connectDB();

// body Parsing middleware
app.use(cookieParser());

//  FIXED CORS HERE — only this line changed 
app.use(cors({
  origin: "http://localhost:5173",
  credentials:true
}));

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.use("/uploads", express.static(path.join("./", "uploads")));

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

const server = app.listen(process.env.PORT, () => {
  // seedData();
  console.log("Server listening on http://localhost:" + process.env.PORT);
});

//  FIXED SOCKET.IO CORS ALSO 
export const io = new Server(server, {
  cors: {
    origin:"http://localhost:5173",
    methods:['GET','POST'],
    credentials:true
  }
});

io.on("connection", socketActions);
