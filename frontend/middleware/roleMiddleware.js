import jwt from "jsonwebtoken";
import { promisify } from "util";

const verifyJWT = promisify(jwt.verify);

export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            console.log("Role is ;", role);
            if (role == "buyer") {
                return res.redirect("/auth/buyer");
            } else if (role == "seller") {
                return res.redirect("/auth/seller");
            } else if (role == "manager") {
                return res.redirect("/manager/login");
            }
        }
        if (req.user.role !== role) {
            console.log("Coming to not equal");

            if (role === "manager") {
                return res.redirect("/manager/login");
            } else {
                return res.redirect("/auth/" + role);
            }
        }
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
        next();
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

        req.user=decoded._id
        next();
    })
}