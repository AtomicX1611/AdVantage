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

const app=express();


await connectDB();

// body Parsing middleware
app.use(cookieParser());
app.use(cors({
  credentials: true
}));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.use("/uploads", express.static(path.join("./", "uploads")));

app.use("/auth",authRouter);
app.use("/buyer",buyerRouter);
app.use("/seller",sellerRouter);

app.use("/admin",adminRouter);

app.listen(process.env.PORT,()=>{
    console.log("Server listening on http://localhost:"+process.env.PORT);
});