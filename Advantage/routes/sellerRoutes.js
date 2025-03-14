import express from "express";
import { sellerLogin } from "../controllers/sellerLogin.js";
import { sellerSignup } from "../controllers/sellerSignUp.js";

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

 const sellerRoutes=express.Router();
sellerRoutes.use(express.json());
sellerRoutes.use(express.urlencoded({extended:true}));

sellerRoutes.get("/login",(req,res)=>{
    res.render("sellerLogin.ejs");
})
sellerRoutes.post("/login",sellerLogin);
sellerRoutes.post("/signup",sellerSignup);
sellerRoutes.get("/dashboard",(req,res)=>{
    if(req.isAuthenticated()) {
        res.render("sellerDashboard.ejs");
    }
    else {
        res.redirect("/seller/login");
    }
})

sellerRouter.get('/addProductForm',(req,res)=>{
  //if not authenticated need to redirect to login page
    res.render('AddproductForm');
});