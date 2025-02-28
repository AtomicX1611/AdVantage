import express from "express";
import { login, signup } from "./authController.js";

const authRouter = express.Router();

authRouter.use("/signup",signup);

authRouter.use("/login",login);

export default authRouter