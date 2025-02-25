import express from "express";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("productDetail.ejs", {
    name: "Page",
    description: "This is a very big desc",
    price: "40",
  });
});


app.listen(port, () => {
  console.log("Listening on port 3000");
});
