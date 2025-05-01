import express from "express";
import { buyerRoutes } from "./routes/buyerRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import authRouter from "./routes/authRoutes.js";
import session from "express-session";
import passport from "passport";
import productRouter from "./routes/productRoutes.js";
import pkg from "passport-local";
import { findAdmins, findSellerByEmail, findUserByEmail } from "./models/MongoUser.js";
import { Server } from "socket.io";
import { sock } from "./controllers/Socket.js";
import cors from "cors";
import managerRouter from "./routes/managerRoutes.js";
import adminRouter from "./routes/adminRouter.js";

const app = express();
const port = 3000;

app.use(cors());

const LocalStrategy = pkg.Strategy;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.json({ limit: "100mb" }));

app.use(
  "/",
  session({
    secret: "user-login-session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.redirect("/buyer/home");
});

app.get("/req", (req, res) => {
  res.render("RequestForm.ejs", { isLogged: true });
});

app.use("/auth", authRouter);
app.use("/buyer", buyerRoutes);
app.use("/seller", sellerRouter);
app.use("/search", searchRouter);
app.use("/product", productRouter);
app.use("/manager", managerRouter);
app.use("/admin",adminRouter)

app.get("/logout", (req, res) => {
  if (req.isAuthenticated()) {
      const redirectPath = req.user.role === "seller" ? "/seller" : "/";

      req.logout((err) => {
          if (err) return next(err);
          req.session.destroy((err) => {
              if (err) return next(err);
              res.redirect(redirectPath);
          });
      });
  } else {
      res.redirect("/");
  }
});


passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async function verify(email, password, cb) {
      let result;
      if (email.slice(email.length - 1, email.length) == "s") {
        email = email.slice(0, email.length - 1);
        result = await findSellerByEmail(email);
      } else if (email.slice(email.length - 1, email.length) == "b") {
        email = email.slice(0, email.length - 1);
        result = await findUserByEmail(email);
        console.log(result);
      } else if (email.slice(email.length - 1, email.length) == "m") {
        console.log("callig find");
        email = email.slice(0, email.length - 1);
        result = managers.find((manager) => manager.email === email);
        console.log("resulkt L: ", result);
      }else if(email.slice(email.length - 1, email.length) == "a"){
        email = email.slice(0,email.length - 1)
        result = findAdmins(email)
        console.log("resulkt admin : ", result);
      }
      console.log(result);
      if (result) {
        if (result.password !== password) {
          console.log(result.password);
          console.log(password);
          return cb(null, false, { message: "Incorrect password" });
        }
        return cb(null, result);
      } else {
        return cb(null, false, { message: "User not found" });
      }
    }
  )
);

let managers = [
  {
    email: "abc@gmail.com",
    password: "12345678",
  },
];

passport.serializeUser((user, cb) => {
  console.log("serialiszing : ");
  cb(null, { email: user.email, role: user.role });
});

passport.deserializeUser(async (user, cb) => {
  cb(null, user);
});

const server = app.listen(port, () => console.log("Running on Port 3000"));
export const io = new Server(server);

io.on("connection", sock);
