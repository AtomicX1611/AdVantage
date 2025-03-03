import express from "express";
import authRouter from "./auth/authRoutes.js";
import passport from "passport";
import cors from "cors";
import session from "express-session"
import searchRouter from "./Search/SearchRoute.js"

import "./config/passportConfig.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use(
  session({
    secret: "user-login-session",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);

app.use("/api/search",searchRouter);

app.listen(5000, () => console.log("Server listening at PORT 5000"));
