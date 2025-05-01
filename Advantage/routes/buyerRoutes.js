import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { chatRoutes } from "./charRoutes.js";
import {
  addToWishlist,
  findProduct,
  freshProducts,
  findUserByEmail,
  getWishlistProducts,
  removeWishlistProduct,
  updateBuyerPassword
} from "../models/MongoUser.js";
import { featuredProducts } from "../models/MongoUser.js";
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
  const products = await getWishlistProducts(req.user.email);
  res.render("wishlist", {
    products: products,
    isLogged: req.isAuthenticated() && req.user.role == "buyer"
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
    isLogged: req.isAuthenticated() && req.user.role == "buyer"
  });
});

buyerRoutes.get('/updatePassword', (req, res) => {
  res.render('buyerUpdatePassword', {
    isLogged: req.isAuthenticated() && req.user.role == "buyer"
  });
});

buyerRoutes.post('/updatePassword', async (req, res) => {
  if (req.body.newPassword !== req.body.confirmNewPassword) {
    res.status(401).json("Password mismatch");
  } else {
    let user = await findUserByEmail(req.body.email);
    if (user) {
      if (user.password === req.body.oldPassword) {
        await updateBuyerPassword(req.body.email,req.body.newPassword);
          req.session.destroy((err)=>{
            if(err){
              console.log(err);
            }else{
              console.log("session destroyed successfully");
            }
          });
          res.redirect('/');
      }else{
        res.status(401).json("Incorrect Old Password");
      }
    } else {
      res.status(401).json("email not found");
    }
  }
});
