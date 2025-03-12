import { findProducts,findProduct } from "../models/User.js";

const searchProducts = async (req, res) => {
  let name = req.query.search;
  let location = req.query.location;
  
  //just for now

  location = "guntur";
  let products = await findProducts(name, location);
  res.render("searchPage.ejs", {
    products: products,
    isLogged: req.isAuthenticated(),
  });
};

const getProductDetails = async (req, res) => {
  const productId = req.params.productId;
  res.render("ProductDetail.ejs", {
    product: findProduct(productId),
    isLogged: req.isAuthenticated(),
  });
};

export { searchProducts,getProductDetails };
