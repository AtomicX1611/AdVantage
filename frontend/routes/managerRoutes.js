import express from "express";
import { getuUnVerifiedProducts,verifyProduct,managerLogin } from "../controllers/managerController.js";
import { managerRole } from "../middleware/roleMiddleware.js";
import { authorize, checkToken, serializeUser } from "../../backend/src/middlewares/protect.js";

const managerRouter = express.Router();

managerRouter.get("/login", (req, res) => {
  res.render("ManagerLogin.ejs",{backendURL: process.env.BACKEND_URL});
});

managerRouter.post("/login",managerLogin)

managerRouter.use(checkToken)
managerRouter.use(serializeUser)

managerRouter.use(managerRole)
managerRouter.get('/dashboard',getuUnVerifiedProducts)
managerRouter.post('/verify',verifyProduct)

export default managerRouter;
