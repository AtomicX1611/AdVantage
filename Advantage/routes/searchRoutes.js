import express from "express";
import {
  getProductDetails,getProductsNoFilter
} from "../controllers/searchController.js";

const searchRouter = express.Router();

searchRouter.get("/noFilter",getProductsNoFilter);

searchRouter.get("/product/:productId", getProductDetails);

export default searchRouter;