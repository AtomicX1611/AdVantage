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
    if (req.user.role !== role) {
      console.log("Coming to not eqwual");
      
      if (role === "manager") {
       return res.redirect("/manager/login");
      }else{
        return res.redirect("/auth/" + role);
      }
    }
    next();
  };
};

export const adminMiddleWare = (req,res,next) => {

    console.log('In admin middleware');
    
    // if(!req.cookies.token){
    //   return res.redirect('/admin/login')
    // }

     jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err,decoded) => {
        if (err) {
            console.log("JWT verification failed:", err.message);
            return res.redirect("/auth/admin/login");
        }
        req.user=decoded._id
        next();
    })
}


