import express, { json } from "express";
import { sellerLogin } from "../controllers/sellerLogin.js";

export const sellerRoutes=express.Router();
sellerRoutes.use(express.json());
sellerRoutes.use(express.urlencoded({extended:true}))

sellerRoutes.post("/login",sellerLogin)

sellerRoutes.get("/cookie",(req,res)=>{
    console.log("req.user in seller/cookie",req.user);
    if(req.isAuthenticated()) {
        console.log("true")
        res.status(200).json({success:"authenticated"});
    }
    else {
        res.json({error:"not authenticated"});
    }
})

sellerRoutes.get("/second",(req,res)=>{
    console.log("req.user in seller/second",req.user);
    if(req.isAuthenticated()) {
        console.log("true")
        res.status(200).json({success:"authenticated"});
    }
    else {
        res.json({error:"not authenticated"});
    }
})