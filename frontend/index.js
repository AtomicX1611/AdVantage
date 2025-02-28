import express from "express";

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

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

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
