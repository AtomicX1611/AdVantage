import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/mongo.config.js";
import cookieParser from "cookie-parser";
import path from "node:path";
import authRouter from "./src/routes/auth.router.js";
import buyerRouter from "./src/routes/buyer.router.js";
import sellerRouter from "./src/routes/seller.router.js";
import adminRouter from "./src/routes/admin.router.js";
import anyoneRouter from "./src/routes/anyone.router.js";
import { chatRouter } from "./src/routes/chat.routes.js";
import { Server } from "socket.io";
import { socketActions } from "./src/controllers/socket.contoller.js";
import { managerRouter } from "./src/routes/manager.router.js";

const app=express();
await connectDB();

// body Parsing middleware
app.use(cookieParser());
app.use(cors({
  origin: "http://10.237.50.129:3001",
  credentials:true
}));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.use("/uploads", express.static(path.join("./", "uploads")));

app.use("/auth",authRouter);
app.use("/buyer",buyerRouter);
app.use("/seller",sellerRouter);
app.use('/manager',managerRouter);
app.use("/admin",adminRouter);
app.use("/anyone",anyoneRouter);
app.use("/chat",chatRouter);

const server=app.listen(process.env.PORT,()=>{
    console.log("Server listening on http://localhost:"+process.env.PORT);
});

export const io=new Server(server,{
  cors: {
    origin:"http://10.237.50.129:3001",
    methods:['GET','POST'],
    credentials:true
  }
});

io.on("connection",socketActions);