import express from "express";
import authRouter from "./routes/authRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import session from "express-session"
import passport from "passport";
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.render("Home.ejs");
});


app.get("/login", (req, res) => {
  res.render("Login.ejs");
});

app.get("/products", (req, res) => {
  res.render("productDetail.ejs", {
    name: "Page",
    description: "This is a very big desc",
    price: "40",
  });
});
app.use("/searchPage",searchRouter);

app.get("/header", (req, res) => {
  res.render("Header.ejs");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.use(
  session({
    secret: "user-login-session",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());