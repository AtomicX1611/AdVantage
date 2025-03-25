import express from "express";
import { verifyProduct } from "../models/User.js";
import passport from "passport";
import { requireRole } from "../middleware/roleMiddleware.js";

const managerRouter = express.Router();

managerRouter.get("/login", (req, res) => {
  res.render("ManagerLogin.ejs");
});

managerRouter.post("/login", (req, res, next) => {
  console.log("Loggin in manageRouyter");
  req.body.email = req.body.email.concat("m");

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.status(401).json({ error: info.message });
    }

    user.role = "manager";
    
    req.login(user, (err) => {
      if (err) {
        console.error("Error during req.login:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      console.log("User logged in:", user);
      return res.status(200).json({ success: "User logged in", user });
    });
  })(req, res, next);
});

managerRouter.post("/verify", requireRole("manager"), async (req, res) => {
  const productId = req.body.pid;

  try {
    const verify = await verifyProduct(productId);
    if (verify) {
      return res.redirect("/dashboard");
    } else {
      return res
        .status(404)
        .json({ message: "Couldnt Verify product,Try again" });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

managerRouter.get("/dashboard", requireRole("manager"), async (req, res) => {
  try {
    const products = await findProductsNotVerified();
    return res.render("ManagerDashboard", { products });
  } catch (error) {
    console.error("Error loading manager dashboard:", error);
    res.status(500).send("Internal Server Error");
  }

  const products = [
    { name: "Product 1", description: "High quality item A", price: 199 },
    { name: "Product 2", description: "Best in class item B", price: 299 },
    { name: "Product 3", description: "Amazing value pack", price: 399 },
    { name: "Product 4", description: "New edition gadget", price: 499 },
    { name: "Product 5", description: "Top seller item", price: 249 },
    { name: "Product 6", description: "Budget friendly option", price: 149 },
    { name: "Product 7", description: "Limited stock item", price: 349 },
    { name: "Product 8", description: "Trending now", price: 289 },
    { name: "Product 9", description: "Customer favorite", price: 189 },
    { name: "Product 10", description: "Combo pack deal", price: 579 },
    { name: "Product 11", description: "Editor's choice", price: 619 },
    { name: "Product 12", description: "Latest launch", price: 699 },
    { name: "Product 13", description: "Best for students", price: 109 },
    { name: "Product 14", description: "Premium segment", price: 999 },
    { name: "Product 15", description: "Eco-friendly product", price: 329 },
  ];

  res.render("ManagerDashboard.ejs", { products });
});

export default managerRouter;
