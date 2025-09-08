import express from "express";
import { getuUnVerifiedProducts,verifyProduct,managerLogin } from "../controllers/managerController.js";

const managerRouter = express.Router();

managerRouter.get("/login", (req, res) => {
  res.render("ManagerLogin.ejs");
});

managerRouter.post("/login",managerLogin);
managerRouter.get('/dashboard',getuUnVerifiedProducts)
managerRouter.post('/verify',verifyProduct)

export default managerRouter;
