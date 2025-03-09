import express from "express";
import authRouter from "./routes/authRoutes.js";
import searchRouter from "./routes/searchRoutes.js";


const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);

app.use("/search", searchRouter);

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

app.get("/header", (req, res) => {
  res.render("Header.ejs");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
