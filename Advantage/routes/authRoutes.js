import express from "express";
import { login, signup } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup",signup);

authRouter.post("/login",login);

authRouter.get("/login", (req, res) => {
    res.render("Login.ejs");
  });

export default authRouter;