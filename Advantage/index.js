import express from "express";
import authRouter from "./routes/authRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import session from "express-session";
import passport from "passport";
import productRouter from "./routes/productRoutes.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/search", searchRouter);
app.use("/product", productRouter);

app.get("/", (req, res) => {
  res.render("Home.ejs");
});


app.get("/login", (req, res) => {
  res.render("Login.ejs");
});

app.get("/searchPage", (req, res) => {
  let condition = req.query.search;

  //Dont use this anymore
  // fetch("http://localhost:5000/api/search/", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     name: "shoes",
  //     location: "sricity",
  //   }),
  // })
  //   .then((res) => res.json())
  //   .then(function (res) {
  //     console.log(res);
  //   });
  res.render("searchPage.ejs", { le: 9 });
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

app.listen(port, () => console.log("Running on Port 3000"));
