import express from "express";
import { buyerRoutes } from "./routes/buyerRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import authRouter from "./routes/authRoutes.js";
import session from "express-session";
import passport from "passport";
import productRouter from "./routes/productRoutes.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.use("/buyer",
  session({
    secret: "user-login-session",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.redirect("/buyer/home");
});

app.use("/buyer", passport.initialize());
app.use("/buyer", passport.session());

app.use(
  "/seller",
  session({
    secret: "seller-login-session",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/seller", passport.initialize());
app.use("/seller", passport.session());

app.use("/auth", authRouter);
app.use("/buyer", buyerRoutes);
app.use("/seller", sellerRouter);
app.use("/search", searchRouter);
app.use("/product", productRouter);

app.listen(port, () => console.log("Running on Port 3000"));
