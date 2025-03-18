import express from "express";
import { buyerRoutes } from "./routes/buyerRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import authRouter from "./routes/authRoutes.js";
import session from "express-session";
import passport from "passport";
import productRouter from "./routes/productRoutes.js";
import pkg from "passport-local";
import { findSellerByEmail, findUserByEmail } from "./models/User.js";
import { Server } from "socket.io";
import { sock } from "./controllers/Socket.js";

const app = express();
const port = 3000;

const LocalStrategy = pkg.Strategy;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.use("/auth", authRouter); 
app.use("/buyer", buyerRoutes);
app.use("/seller", sellerRouter);
app.use("/search", searchRouter);
app.use("/product", productRouter);

app.use("/admin/dashboard", (req, res) => {
  if(req.isAuthenticated){
    res.render("Admin.ejs");
   }else{
    res.render({message : "Cannot access Admin features"})
   }
});
app.use("/admin",(req,res) => {
  res.render("AdminLogin.ejs");
})

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function verify(email, password, cb) {
      let result;

      if (email.slice(email.length-1,email.length) == 's') {
        email = email.slice(0,email.length-1);
        result = findSellerByEmail(email);
      } else {
        email = email.slice(0,email.length-1);
        result = findUserByEmail(email);
      }
      
      if (result) {
        if (result.password !== password) {
          return cb(null, false, { message: "Incorrect password" });
        }
        return cb(null, result);
      } else {
        return cb(null, false, { message: "User not found" });
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  console.log("serialiszing : ");
  cb(null, { email: user.email, role: user.role });
});

passport.deserializeUser(async (user, cb) => {
  console.log("Deserializing");
  cb(null, user);
});

const server = app.listen(port, () => console.log("Running on Port 3000"));
export const io = new Server(server);

let activeUsers = new Map();

io.on("connection", sock);``