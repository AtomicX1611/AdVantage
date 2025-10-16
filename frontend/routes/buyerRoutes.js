import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
import { chatRoutes } from "./charRoutes.js";
// import fetch from "node-fetch";
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
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { buyerMiddleWare } from "../middleware/roleMiddleware.js";

export const verifyJwt = promisify(jwt.verify);

export const buyerRoutes = express.Router();

buyerRoutes.use(express.json());
buyerRoutes.use(express.urlencoded({ extended: true }));
buyerRoutes.use("/chats", chatRoutes);

buyerRoutes.get("/home", async (req, res) => {
  let isLogged = false;

  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "buyer");
    }
  } catch (err) {
    isLogged = false;
  }

  try {
    const apiResponse = await fetch(`${process.env.BACKEND_URL}anyone/HomeRequirements`);
    const response = await apiResponse.json();

    res.render("Home.ejs", {
      isLogged: isLogged,
      freshProducts: response.freshProducts || [],
      featuredProducts: response.featuredProducts || [],
      backendURL: process.env.BACKEND_URL,
    });
  } catch (error) {
    res.render("Home.ejs", {
      isLogged: isLogged,
      freshProducts: [],
      featuredProducts: [],
      backendURL: process.env.BACKEND_URL,
    });
  }
});


buyerRoutes.get("/profile", buyerMiddleWare, async (req, res) => {
  let isLogged = false;
  console.log("Calling profile");
  
  try {
    // console.log(req.cookies);
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "buyer");
    }
  } catch (err) {
    // console.log("hhh : ");
    // console.log(err);
    isLogged = false;
  }
  if (isLogged) res.render("Profile.ejs", { isLogged: true,backendURL: process.env.BACKEND_URL });
  else res.redirect("/auth/buyer");
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

    const response = await fetch(`${process.env.BACKEND_URL}buyer/wishlist/add/${productId}`, {
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


buyerRoutes.get("/wishlist", async (req, res) => {
  // console.log("hii");
  let isLogged = false;
  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "buyer");
    }
  } catch (err) {
    isLogged = false;
  }
  if (isLogged === false) {
    return res.redirect("/auth/buyer/login");
  }

  const backendRes = await fetch(`${process.env.BACKEND_URL}buyer/wishlist`, {
    method: "GET",
    headers: {
      cookie: req.headers.cookie || "",
    },
  });

  const data = await backendRes.json();
  // console.log(data);
  res.render("wishlist", {
    products: data.products,
    isLogged: isLogged,
    backendURL: process.env.BACKEND_URL,
  });
});

buyerRoutes.get("/wishlist/remove/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL}buyer/wishlist/remove/${productId}`, {
      method: "DELETE",
      headers: {
        cookie: req.headers.cookie || "",
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      console.error("Failed to remove from wishlist:", data);
      return res.status(backendRes.status).json(data);
    }

    res.redirect("/buyer/wishlist");
  } catch (err) {
    console.error("Proxy error (removeFromWishlist):", err);
    res.status(500).json({
      success: false,
      message: "Internal server error (proxy)",
    });
  }
});

// buyerRoutes.get("/featuredProd", async (req, res) => {
//   let data = await featuredProducts();
//   console.log(data.length);
//   res.status(200).json(data);
// });

// buyerRoutes.get("/freshProd", async (req, res) => {
//   let data = await freshProducts();
//   console.log(data.length);
//   res.status(200).json(data);
// });

buyerRoutes.get("/contact", requireRole("buyer"), (req, res) => {
  res.render("ContactUs.ejs", {
    isLogged: req.isAuthenticated() && req.user.role == "buyer",backendURL: process.env.BACKEND_URL,
  });
});

buyerRoutes.get("/updatePassword", async (req, res) => {
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
    backendURL: process.env.BACKEND_URL,
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

    const response = await fetch(`${process.env.BACKEND_URL}buyer/update/password`, {
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

buyerRoutes.get("/buy/:productId", buyerMiddleWare, async (req, res) => {
  const { productId } = req.params;

  try {
    const backendRes = await fetch(`${process.env.BACKEND_URL}buyer/request/${productId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie || "",
      },
    });

    const data = await backendRes.json();
    console.log("data: ",data);
    if (!backendRes.ok) {
      if(backendRes.status==403){
        return res.redirect("/auth/buyer");
      }
      return res.status(backendRes.status).json(data);
    }

    res.redirect(`/search/product/${req.params.productId}`);
  } catch (err) {
    console.error("Proxy error (buy product):", err);
    res.status(500).json({
      success: false,
      message: "Internal server error (proxy)",
    });
  }
});

buyerRoutes.get("/yourProducts", async (req, res) => {
  try {
    // call backend API with cookies forwarded
    const backendRes = await fetch(`${process.env.BACKEND_URL}buyer/yourProducts`, {
      method: "GET",
      headers: {
        cookie: req.headers.cookie || "",
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return res.render("yourproducts.ejs", {
        isLogged: !!req.cookies?.token,
        userProducts: [],
        error: data.message || "Failed to load your products",
        backendURL: process.env.BACKEND_URL,
      });
    }

    res.render("yourproducts.ejs", {
      isLogged: !!req.cookies?.token,
      userProducts: data.products || [],
      backendURL: process.env.BACKEND_URL,
    });
  } catch (err) {
    console.error("Proxy error (/yourProducts):", err);
    res.render("yourproducts.ejs", {
      isLogged: !!req.cookies?.token,
      userProducts: [],
      error: "Internal server error (proxy)",
      backendURL: process.env.BACKEND_URL,
    });
  }
});
