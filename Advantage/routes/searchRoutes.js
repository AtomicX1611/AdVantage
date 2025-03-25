import express from "express";
import {
  getProductDetails,getProductsNoFilter,getProductBycategory
} from "../controllers/searchController.js";

const searchRouter = express.Router();

searchRouter.get("/noFilter",getProductsNoFilter);

searchRouter.get("/product/:productId", getProductDetails);

searchRouter.get("/product/category/:category",getProductBycategory);

export default searchRouter;