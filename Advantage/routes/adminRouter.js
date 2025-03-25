import experss from "express";
import passport from "passport";

const adminRouter = experss.Router();

adminRouter.get("/login", (req, res) => {
  res.render("AdminLogin.ejs");
});

adminRouter.post("/login", (req, res, next) => {
  req.body.email = req.body.email.concat("a");
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if(!user){
      console.log("Authentication failed:", info.message);
      return res.status(401).json({ error: info.message });
    }

    user.role = "admin";
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error during req.login:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      console.log("User logged in:", user);
      return res.status(200).json({ success: "User logged in", user });
    });
  })(req, res, next);
});

adminRouter.get("/", (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    res.render("Admin.ejs");
  } else {
    res.redirect("/admin/login");
  }
});

export default adminRouter;
