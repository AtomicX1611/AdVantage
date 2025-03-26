import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { chatRoutes } from "./charRoutes.js";
import {
  addToWishlist,
  findProduct,
  freshProducts,
  getWishlistProducts,
  removeWishlistProduct,
} from "../models/User.js";
import { featuredProducts } from "../models/User.js";
// import { freshProducts } from "../models/User.js";
import { lch } from "d3";

export const buyerRoutes = express.Router();

buyerRoutes.use(express.json());
buyerRoutes.use(express.urlencoded({ extended: true }));
buyerRoutes.use("/chats", chatRoutes);

buyerRoutes.get("/home", async (req, res) => {
  let freshProductsFetched=await freshProducts();
  let featuredProductsFetched=await featuredProducts();
  res.render("Home.ejs", {
    isLogged: req.isAuthenticated() && req.user.role == "buyer",
    freshProducts: freshProductsFetched,
    featuredProducts: featuredProductsFetched,
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

buyerRoutes.get("/featuredProd",async (req,res)=>{
  let data=await featuredProducts();
  console.log(data.length);
  res.status(200).json(data);
})

buyerRoutes.get("/freshProd",async (req,res)=>{
  let data=await freshProducts();
  console.log(data.length);
  res.status(200).json(data);
});

buyerRoutes.get("/contact", requireRole("buyer"), (req, res) => {
  res.render("ContactUs.ejs", {
    isLogged: req.isAuthenticated() && req.user.role == "buyer",
  });
});
