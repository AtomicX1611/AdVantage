import express from "express";
import {
  getProductDetails
} from "../controllers/searchController.js";
import { findProducts } from "../models/User.js";

const searchRouter = express.Router();

searchRouter.get("/noFilter",async (req,res) => {
   let name = req.query.search;
  let products = await findProducts(name);
      console.log(products);
      res.render("searchPage.ejs", {
      products: products,
      isLogged: req.isAuthenticated && (req.user.role == "buyer")
    });
});

searchRouter.get("/product/:productId", getProductDetails);

export default searchRouter;
