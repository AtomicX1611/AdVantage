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
  updateBuyerPassword,
  increaseSold,
  findUserProducts,
} from "../models/MongoUser.js";
import { featuredProducts } from "../models/MongoUser.js";
// import { freshProducts } from "../models/User.js";
import { lch } from "d3";
import jwt from "jsonwebtoken";
import { promisify } from "util";

const verifyJwt = promisify(jwt.verify);

export const buyerRoutes = express.Router();

buyerRoutes.use(express.json());
buyerRoutes.use(express.urlencoded({ extended: true }));
buyerRoutes.use("/chats", chatRoutes);

buyerRoutes.get("/home", async (req, res) => {
  let freshProductsFetched = await freshProducts();
  let featuredProductsFetched = await featuredProducts();
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

buyerRoutes.post("/wishlist/add", async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required",
      });
    }

    const response = await fetch(`http://localhost:3000/buyer/wishlist/add/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
    });

    const data = await response.json();

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy (wishlist add)",
    });
  }
});


buyerRoutes.get("/wishlist", requireRole("buyer"), async (req, res) => {
  const products = await getWishlistProducts(req.user.email);
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

buyerRoutes.get("/featuredProd", async (req, res) => {
  let data = await featuredProducts();
  console.log(data.length);
  res.status(200).json(data);
});

buyerRoutes.get("/freshProd", async (req, res) => {
  let data = await freshProducts();
  console.log(data.length);
  res.status(200).json(data);
});

buyerRoutes.get("/contact", requireRole("buyer"), (req, res) => {
  res.render("ContactUs.ejs", {
    isLogged: req.isAuthenticated() && req.user.role == "buyer",
  });
});

buyerRoutes.get("/updatePassword",async (req, res) => {
  let isLogged = false;
  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "buyer");
    }
  } catch (err) {
    isLogged = false;
  }
  res.render("buyerUpdatePassword", {
    isLogged: isLogged,
  });
});

buyerRoutes.post("/updatePassword", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both oldPassword and newPassword are required",
      });
    }

    const response = await fetch("http://localhost:3000/buyer/update/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong in frontend proxy (updatePassword)",
    });
  }
});

buyerRoutes.get("/buy/:productId", requireRole("buyer"), async (req, res) => {
  let product = await findProduct(req.params.productId);
  if (product.sold != 0) {
    res.redirect(`/search/product/${req.params.productId}`);
  } else {
    console.log(req.user.email);
    await increaseSold(req.user.email, req.params.productId);
    res.redirect(`/search/product/${req.params.productId}`);
  }
});
buyerRoutes.get("/yourProducts", async (req, res) => {
  let products = await findUserProducts(req.user.email);
  console.log("User products : ", products);

  res.render("yourproducts.ejs", {
    isLogged: true,
    userProducts: products ? products : [],
  });
});
