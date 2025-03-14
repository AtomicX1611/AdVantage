import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
// import { sellerLogin } from "../controllers/sellerLogin.js";
// import { sellerSignup } from "../controllers/sellerSignUp.js";

const sellerRouter = express.Router();

sellerRouter.use(express.json());
sellerRouter.use(express.urlencoded({ extended: true }));

// sellerRouter.post("/login", sellerLogin);

sellerRouter.get("/",requireRole("seller"),(req, res) => {
  res.render("SellerDashBoard.ejs");
});

export default sellerRouter

//  const sellerRoutes=express.Router();
// sellerRoutes.use(express.json());
// sellerRoutes.use(express.urlencoded({extended:true}));

// sellerRoutes.get("/login",(req,res)=>{
//     res.render("sellerLogin.ejs");
// })
// sellerRoutes.post("/login",sellerLogin);
// sellerRoutes.post("/signup",sellerSignup);
// sellerRoutes.get("/dashboard",(req,res)=>{
//     if(req.isAuthenticated()) {
//         res.render("sellerDashboard.ejs");
//     }
//     else {
//         res.redirect("/seller/login");
//     }
// })

sellerRouter.get('/addProductForm',(req,res)=>{
  //if not authenticated need to redirect to login page
    res.render('AddproductForm');
});