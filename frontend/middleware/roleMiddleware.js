import jwt from "jsonwebtoken";
import { verifyJwt } from "../routes/buyerRoutes.js";

export const requireRole = (role) => {
    //Commented this whole function  
    //because req.isAuth is passport.js function and we are not using that .
    return (req, res, next) => {
        next();
    };
};

export const sellerMiddleware = (req, res, next) => {
    if (!req.cookies.token) {
        return res.redirect("/auth/seller");
    }
    const token = req.cookies.token;

    jwt.verify(token, process.env.JWT_SECRET, (err,decoded) => {
        if (err) {
            console.log("JWT verification failed:", err.message);
            return res.redirect("/auth/seller");
        }

        req.user=decoded._id
        if(decoded.role=="seller"){
            return next();
        }else{
            return res.redirect("/auth/seller");
        }
    })
}

export const buyerMiddleWare = (req,res,next) => {
  
    if(!req.cookies.token) {
        return res.redirect("/auth/buyer");
    }
    const token=req.cookies.token;

    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=> {
        if(err) {
            console.log("JWT verification failed:", err.message);
            return res.redirect("/auth/buyer");
        }
        console.log("decoded: ",decoded);
        if(decoded.role !== "buyer") {
          return res.redirect("/auth/buyer");
        }
        req.user=decoded._id
        next();
    })
}


export const adminMiddleWare = (req,res,next) => {    
    // if(!req.cookies.token){
    //   return res.redirect('/admin/login')
    // }
     jwt.verify(req.cookies.token,process.env.JWT_SECRET, (err,decoded) => {
        if (err) {
            console.log("JWT verification failed:", err.message);
            return res.redirect("/admin/login");
        }
        console.log("decoded: ",decoded);
        if(decoded.role!="admin") {
          console.log("redirecting...");
          return res.redirect("/admin/login");
        }
        req.user=decoded._id
        next();
    })
}

export const managerMiddleWare = (req,res,next) => {
    jwt.verify(req.cookies.token, "XXX", (err,decoded) => {
        if (err) {
            console.log("JWT verification failed:", err.message);
            return res.redirect("/manager/login");
        }
        if(decoded.role!=="manager") {
          return res.redirect("/manager/login");
        }
        req.user=decoded._id
        next();
    })
}

export const managerRole = async (req,res,next) => {
    // console.log("cominguu");
    let isLogged = false;
  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
    //   console.log("managerRole");
    //   console.log(decoded);
      isLogged = (decoded.role == "manager");
    }
  } catch (err) {
    console.log(err);
    isLogged = false;
  }
  if (isLogged === false) {
    return res.redirect("/manager/login");
  }
  next();
}

export const adminRole = async (req,res,next) => {
     let isLogged = false;
  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "admin");
    }
  } catch (err) {
    isLogged = false;
  }
  if (isLogged === false) {
    return res.redirect("/admin/login");
  }
  next()
}