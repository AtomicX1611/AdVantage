import express from "express";
import {
  getProductDetails,getProductsNoFilter,getProductBycategory
} from "../controllers/searchController.js";
import { softBuyer } from "../middleware/roleMiddleware.js";

const searchRouter = express.Router();

searchRouter.get("/noFilter",softBuyer,getProductsNoFilter);

searchRouter.get("/product/:productId", softBuyer, getProductDetails);

searchRouter.get("/product/category/:category", softBuyer,getProductBycategory);

export default searchRouter;