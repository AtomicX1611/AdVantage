import experss from "express";
import { getGraphData, getUsersData, removeSeller } from "../controllers/adminController.js";
import { adminMiddleWare, adminRole } from "../middleware/roleMiddleware.js";

const adminRouter = experss.Router();

adminRouter.get("/login", (req, res) => {  
  res.render("AdminLogin.ejs",{backendURL: process.env.BACKEND_URL});
});

// adminRouter.use(adminMiddleWare)
// adminRouter.use(adminRole)
adminRouter.get('/', getUsersData)
adminRouter.get('/graph',getGraphData)
adminRouter.get('/remove/:id',removeSeller)

export default adminRouter;

// adminRouter.post("/login", (req, res, next) => {
//   req.body.email = req.body.email.concat("a");
//   passport.authenticate("local", (err, user, info) => {
//     if (err) {
//       console.error("Error during authentication:", err);
//       return res.status(500).json({ error: "Internal server error" });
//     }

//     if(!user){
//       console.log("Authentication failed:", info.message);
//       return res.status(401).json({ error: info.message });
//     }

//     user.role = "admin";
//     req.logIn(user, (err) => {
//       if (err) {
//         console.error("Error during req.login:", err);
//         return res.status(500).json({ error: "Internal server error" });
//       }
//       console.log("User logged in:", user);
//       return res.status(200).json({ success: "User logged in", user });
//     });
//   })(req, res, next);
// });

// adminRouter.get("/", async (req, res) => {
//   if (req.isAuthenticated() && req.user.role === "admin") {
//     //need to send sellers array
//     let sellers=await findSellersForAdmin();
//     let users=await findUsersForAdmin();
//     res.render("Admin.ejs",{sellers:sellers,users:users});
//   } else {
//     res.redirect("/admin/login");
//   }
// });
