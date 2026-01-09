import express from "express";
import {
    getFeaturedFreshProducts,
    getProductDetails,
    getProducts,
} from "../controllers/anyone.controller.js";

export const router = express.Router();

router.get("/HomeRequirements",getFeaturedFreshProducts);

router.get("/products/filtered",getProducts);

router.get("/products/:productId",getProductDetails);


export default router;