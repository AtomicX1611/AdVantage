import express from "express";
import { login, signup } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/buyer/signup", signup);

authRouter.post("/buyer/login", login);

authRouter.post("/sellerLogin");

authRouter.post("/sellerSignUp");

// TO DO :
// authRouter.post("/seller/signup");
// authRouter.post("seller/login");

authRouter.get("/buyer", (req, res) => {
  res.render("Login.ejs");
});

authRouter.get("/seller", (req, res) => {
  res.render("sellerLogin.ejs");
});

export default authRouter;
