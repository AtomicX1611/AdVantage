import express from "express";

const productRouter = express.Router();

productRouter.get("/", (req, res) => {
  res.render("productDetail.ejs", {
    name: "Page",
    description: "This is a very big desc",
    price: "40",
  });
});

export default productRouter;
