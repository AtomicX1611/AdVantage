export const requireRole = (role) => {
    return (req, res, next) => {
      if (!req.isAuthenticated() ) {
        if(role=="buyer") {
          return res.redirect("/auth/buyer");
        }
        else if(role=="seller") {
          return res.redirect("/auth/seller");
        }
      }
      if (req.user.role !== role) {
        if(req.user.role=="buyer") {
          return res.redirect("/auth/seller");
        }
        else if(req.user.role=="seller") {
          return res.redirect("/auth/buyer");
        }
      }
      next();
    };
  };