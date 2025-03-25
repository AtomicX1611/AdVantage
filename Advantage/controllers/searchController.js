import { findProducts,findProduct,findProductsByCategory } from "../models/User.js";

// const searchProducts = async (req, res) => {
//   let name = req.query.search;
//   let location = req.query.location;
  
//   //just for now

//   location = "guntur";
//   let products = await findProducts(name, location);
//   res.render("searchPage.ejs", {
//     products: products,
//     isLogged: true,
//   });
// };

export const getProductsNoFilter = async (req,res) => {
  let name = req.query.search;
 let products = await findProducts(name);
     res.render("searchPage", {
     products: products,
     isLogged: req.isAuthenticated() && (req.user.role == "buyer")
   });
}

export const getProductDetails = async (req, res) => {
  const productId = req.params.productId;
  let pro=await findProduct(productId);
  res.render("ProductDetail", {
    product: pro,
    isLogged: req.isAuthenticated() && (req.user.role == "buyer"),
    manager : req.isAuthenticated() && (req.user.role == "manager")
  });
};

export const getProductBycategory = async (req,res) => {
  const category = req.params.category;
  const products = await findProductsByCategory(category);
  res.render("searchPage",{
    products: products,
    isLogged: req.isAuthenticated() && (req.user.role == "buyer")
  });
}

