import express, { json } from "express";
import { buyerLogin } from "../controllers/buyerLogin.js";

export const buyerRoutes=express.Router();
buyerRoutes.use(express.json());
buyerRoutes.use(express.urlencoded({extended:true}));

buyerRoutes.get("/home",(req,res)=>{
    if(req.isAuthenticated()) {
        res.render("Home.ejs",{isLogged:true});
    }
    else {
        res.render("Home.ejs",({isLogged:false}));
    }
});

buyerRoutes.get("/profile",(req,res)=>{
    if(req.isAuthenticated()) {
        res.render("Profile.ejs",{isLogged:true});
    }
    else {
        res.send("No data");
    }
})
buyerRoutes.post("/login",buyerLogin)


// buyerRoutes.get("/cookie",(req,res)=>{
//     console.log("req.user in buyer/cookie",req.user);
//     if(req.isAuthenticated()) {
//         console.log("true")
//         res.status(200).json({success:"authenticated"});
//     }
//     else {
//         res.json({error:"not authenticated"});
//     }
// })

// buyerRoutes.get("/second",(req,res)=>{
//     console.log("req.user in buyer/cookie",req.user);
//     if(req.isAuthenticated()) {
//         console.log("true")
//         res.status(200).json({success:"authenticated"});
//     }
//     else {
//         res.json({error:"not authenticated"});
//     }
// })