import express from "express";
import {
    getFeaturedFreshProducts,
    getProductDetails,
    getProducts,
} from "../controllers/anyone.controller.js";

/**
 * @swagger
 * tags:
 *   - name: Anyone
 *     description: Public product endpoints
 */

export const router = express.Router();

/**
 * @swagger
 * /anyone/HomeRequirements:
 *   get:
 *     summary: Get featured and fresh products
 *     tags: [Anyone]
 *     responses:
 *       200:
 *         description: Successful response with featured and fresh products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 freshProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                 featuredProducts:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/HomeRequirements",getFeaturedFreshProducts);

/**
 * @swagger
 * /anyone/products/filtered:
 *   get:
 *     summary: Get products with optional filters
 *     tags: [Anyone]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Partial or full product name to search
 *       - in: query
 *         name: isRental
 *         schema:
 *           type: boolean
 *         description: Filter by rental products (true/false)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: postingDate
 *         schema:
 *           type: string
 *           format: date
 *         description: ISO date string to filter postings after this date
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/products/filtered",getProducts);

/**
 * @swagger
 * /anyone/products/{productId}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Anyone]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 product:
 *                   type: object
 *       404:
 *         description: Product not found
 */
router.get("/products/:productId",getProductDetails);


export default router;