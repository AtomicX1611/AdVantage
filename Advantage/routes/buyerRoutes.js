import express from "express";
import { requireRole } from "../middleware/roleMiddleware.js";
// import { buyerLogin } from "../controllers/buyerLogin.js";
// import { buyerSignup } from "../controllers/buyerSignUp.js";

export const buyerRoutes = express.Router();

buyerRoutes.use(express.json());
buyerRoutes.use(express.urlencoded({ extended: true }));

buyerRoutes.get("/home", (req, res) => {
   
  if (req.isAuthenticated()) res.render("Home.ejs", { isLogged: true });
  else res.render("Home.ejs", { isLogged: false });
});


buyerRoutes.get("/profile",requireRole("buyer") ,(req, res) => {
  if (req.isAuthenticated()) res.render("Profile.ejs", { isLogged: true });
  else res.send("No data");
});

// buyerRoutes.post("/login", buyerLogin);

buyerRoutes.get("/chats", (req,res)=>{
    if(req.isAuthenticated() && req.user.role=="buyer") {
        res.render("buyerChat.ejs",{isLogged:true});
    }
    else{
        res.send("No data!! please login")
    }
})
// buyerRoutes.post("/login",buyerLogin);
// buyerRoutes.post("/signup",buyerSignup);




