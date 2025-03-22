import express from "express";
import { verifyProduct } from "../models/User.js";
import passport from "passport";
import { requireRole } from "../middleware/roleMiddleware.js";

const managerRouter = express.Router();

managerRouter.get("/login", (req, res) => {
  res.render("ManagerLogin.ejs");
});

managerRouter.post("/login", (req, res, next) => {
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
  const productId = req.params.pid;

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

managerRouter.get("/dashboard",requireRole("manager") ,(req, res) => {
  res.render("ManagerDashboard.ejs");
});

export default managerRouter;
