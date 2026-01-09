import express from "express";

const productRouter = express.Router();

productRouter.get("/", (req, res) => {
  res.render("productDetail.ejs", {
    name: "Page",
    description: "This is a very big desc",
    price: "40",
    backendURL: process.env.BACKEND_URL,
  });
});

export default productRouter;
