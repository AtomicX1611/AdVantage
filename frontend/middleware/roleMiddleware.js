import jwt from "jsonwebtoken";

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
        if (req.user.role !== role){
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
export const adminMiddleWare = (req,res,next) => {    
    // if(!req.cookies.token){
    //   return res.redirect('/admin/login')
    // }
     jwt.verify(req.cookies.token, "XXX", (err,decoded) => {
        if (err) {
            console.log("JWT verification failed:", err.message);
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
        req.user=decoded._id
        next();
    })
}

export const managerRole = async (req,res,next) => {
     let isLogged = false;
  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "manager");
    }
  } catch (err) {
    isLogged = false;
  }
  if (isLogged === false) {
    return res.redirect("/admin/login");
  }
  next()
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