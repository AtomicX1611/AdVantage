import express from "express";
import {buyerRoutes} from "./routes/buyerRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import session from "express-session"
import passport from "passport";
import { sellerRoutes } from "./routes/sellerRoutes.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: "user-login-session",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
app.use("/buyer",
  session({
    secret: "user-login-session",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/buyer",passport.initialize());
app.use("/buyer",passport.session());

app.use("/seller",
  session({
    secret: "seller-login-session",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/seller",passport.initialize());
app.use("/seller",passport.session());

app.use("/buyer", buyerRoutes);
app.use("/seller",sellerRoutes);

app.use("/search", searchRouter);

app.get("/", (req, res) => {
  res.redirect("/buyer/home")
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

app.get("/sellerHeader",(req,res)=>{
  res.render("sellerHeader.ejs");
})
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

