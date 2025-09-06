import express from "express";
import {
    getFeaturedFreshProducts,
} from "../controllers/anyone.controller.js";

export const router = express.Router();

router.get("/HomeRequirements",getFeaturedFreshProducts);


export default router;