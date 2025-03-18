import express from "express";
import { buyerLogin, buyerSignup,sellerLogin,sellerSignup } from "../controllers/authController.js";

const authRouter = express.Router();
export let activeUsers=new Map();

authRouter.post("/buyer/signup", buyerSignup);
authRouter.post("/buyer/login", buyerLogin);

authRouter.post("/sellerLogin",sellerLogin);
authRouter.post("/sellerSignUp",sellerSignup);

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
