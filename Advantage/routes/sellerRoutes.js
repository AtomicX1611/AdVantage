import express from "express";
import { sellerLogin } from "../controllers/sellerLogin.js";

const sellerRouter = express.Router();

sellerRouter.use(express.json());
sellerRouter.use(express.urlencoded({ extended: true }));

sellerRouter.post("/login", sellerLogin);

sellerRouter.get("/", (req, res) => {
  let a;
  if(req.isAuthenticated){
      console.log("user Auth as seller done")
      res.render("SellerDashBoard.ejs");
  }else{
    console.log("user auth as seller not done")
  }
});

sellerRouter.get("/cookie", (req, res) => {
  console.log("req.user in seller/cookie", req.user);
  if (req.isAuthenticated()) {
    console.log("true");
    res.status(200).json({ success: "authenticated" });
  } else {
    res.json({ error: "not authenticated" });
  }
});

sellerRouter.get("/second", (req, res) => {
  console.log("req.user in seller/second", req.user);
  if (req.isAuthenticated()) {
    console.log("true");
    res.status(200).json({ success: "authenticated" });
  } else {
    res.json({ error: "not authenticated" });
  }
});

export default sellerRouter