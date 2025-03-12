import express, { json } from "express";
import { sellerLogin } from "../controllers/sellerLogin.js";
import { sellerSignup } from "../controllers/sellerSignUp.js";

export const sellerRoutes=express.Router();
sellerRoutes.use(express.json());
sellerRoutes.use(express.urlencoded({extended:true}));

sellerRoutes.get("/login",(req,res)=>{
    res.render("sellerLogin.ejs");
})
sellerRoutes.post("/login",sellerLogin);
sellerRoutes.post("/signup",sellerSignup);
sellerRoutes.get("/dashboard",(req,res)=>{
    if(req.isAuthenticated()) {
        res.render("sellerDashboard.ejs");
    }
    else {
        res.redirect("/seller/login");
    }
})

// sellerRoutes.get("/cookie",(req,res)=>{
//     console.log("req.user in seller/cookie",req.user);
//     if(req.isAuthenticated()) {
//         console.log("true")
//         res.status(200).json({success:"authenticated"});
//     }
//     else {
//         res.json({error:"not authenticated"});
//     }
// })
// sellerRoutes.get("/second",(req,res)=>{
//     console.log("req.user in seller/second",req.user);
//     if(req.isAuthenticated()) {
//         console.log("true")
//         res.status(200).json({success:"authenticated"});
//     }
//     else {
//         res.json({error:"not authenticated"});
//     }
// })