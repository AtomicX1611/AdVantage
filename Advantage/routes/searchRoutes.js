import express from "express";
import { findProducts,findProduct } from "../models/User.js";

const searchRouter=express.Router();

searchRouter.get("/noFilter", async (req,res) =>{
    let name = req.query.search;
    let location=req.query.location;
    //just for now 
    location="guntur";
    let products = await findProducts(name,location);
    res.render("searchPage.ejs", { products:products ,isLogged:req.isAuthenticated()});
});
searchRouter.get("/product/:productId",async (req,res) =>{
    const productId = req.params.productId;
    res.render("ProductDetail.ejs",{product:findProduct(productId),isLogged:req.isAuthenticated()});
});

export default searchRouter;