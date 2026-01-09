import express from "express";
import { buyerLogin, buyerSignup,sellerLogin,sellerSignup,adminLogin } from "../controllers/authController.js";

const authRouter = express.Router();
export let activeUsers=new Map();

authRouter.post("/buyer/signup", buyerSignup);
authRouter.post("/buyer/login", buyerLogin);

authRouter.post("/sellerLogin",sellerLogin);
authRouter.post("/sellerSignUp",sellerSignup);

authRouter.post("/admin/login",adminLogin);

// TO DO :
// authRouter.post("/seller/signup");
// authRouter.post("seller/login");

authRouter.get("/buyer", (req, res) => {
  res.render("Login.ejs",{backendURL: process.env.BACKEND_URL});
});

authRouter.get("/seller", (req, res) => {
  res.render("sellerLogin.ejs",{backendURL: process.env.BACKEND_URL});
});

export default authRouter;
