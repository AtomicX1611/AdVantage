export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      console.log("Rple is ;", role);
      if (role == "buyer") {
        return res.redirect("/auth/buyer");
      } else if (role == "seller") {
        return res.redirect("/auth/seller");
      } else if (role == "manager") {
        return res.redirect("/manager/login");
      }
    }
    if (req.user.role !== role) {
      if (req.user.role == "buyer") {
        return res.redirect("/");
      } else if (req.user.role == "seller") {
        return res.redirect("/seller/dashboard");
      } else if (req.user.role === "manager") {
        return res.redirect("/manger/dashboard");
      }
    }
    next();
  };
};
