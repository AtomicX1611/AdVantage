import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { chatRoutes } from "./charRoutes.js";
import {
  addToWishlist,
  featuredProducts,
  findProduct,
  findUserByEmail,
  getWishlistProducts,
  removeWishlistProduct,
} from "../models/User.js";

// import { buyerLogin } from "../controllers/buyerLogin.js";
// import { buyerSignup } from "../controllers/buyerSignUp.js";
import { freshProducts } from "../models/User.js";

export const buyerRoutes = express.Router();

buyerRoutes.use(express.json());
buyerRoutes.use(express.urlencoded({ extended: true }));
buyerRoutes.use("/chats", chatRoutes);

buyerRoutes.get("/home", (req, res) => {
  res.render("Home.ejs", {
    isLogged: req.isAuthenticated() && req.user.role == "buyer",
    freshProducts: freshProducts,
    featuredProducts: featuredProducts,
  });
});

buyerRoutes.get("/profile", requireRole("buyer"), (req, res) => {
  if (req.isAuthenticated()) res.render("Profile.ejs", { isLogged: true });
  else res.send("No data");
});

// buyerRoutes.get("/chats", (req,res)=>{
//     if(req.isAuthenticated() && req.user.role=="buyer") {
//         res.render("buyerChat.ejs",{isLogged:true});
//     }
//     else{
//         res.send("No data!! please login");
//     }
// })

buyerRoutes.post("/wishlist/add", requireRole("buyer"), async (req, res) => {
  try {
    const message = await addToWishlist(req.user.email, req.body.productId);
    res.status(200).json({ message: message });
  } catch (err) {
    console.log("catch block");
    res.status(200).json({ message: err });
  }
});

buyerRoutes.get("/wishlist", requireRole("buyer"), async (req, res) => {
  const productIds = await getWishlistProducts(req.user.email);
  console.log("product ids" + productIds);
  // const products=productIds.map(async (obj)=> await findProduct(obj.productId));
  let products = new Array(),
    product;
  for (let productIdobj of productIds) {
    product = await findProduct(productIdobj.ProductId);
    products.push(product);
  }
  console.log(products);
  console.log(products);
  res.render("wishlist", {
    products: products,
    isLogged: req.isAuthenticated() && req.user.role == "buyer",
  });
});

buyerRoutes.get(
  "/wishlist/remove/:productId",
  requireRole("buyer"),
  async (req, res) => {
    const productId = req.params.productId;
    const userEmail = req.user.email;
    await removeWishlistProduct(userEmail, productId);
    res.redirect("/buyer/wishlist");
  }
);

buyerRoutes.get("/contact", requireRole("buyer"), (req, res) => {
  res.render("ContactUs.ejs", {
    isLogged: req.isAuthenticated() && req.user.role == "buyer"
  });
});

buyerRoutes.get('/updatePassword',(req,res) =>{
  res.render('buyerUpdatePassword',{
    isLogged: req.isAuthenticated() && req.user.role == "buyer"
  });
});

buyerRoutes.post('/updatePassword',(req,res)=>{
  let user=findUserByEmail(req.body.email);
  if(user){
      
  }else{
    res.send("email not found");
  }
});
