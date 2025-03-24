import { findProducts,findProduct } from "../models/User.js";

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
     res.render("searchPage.ejs", {
     products: products,
     isLogged: req.isAuthenticated() && (req.user.role == "buyer")
   });
}

export const getProductDetails = async (req, res) => {
  let manager = false;
  if(req.user.role === "manager"){
    manager = true
}
  const productId = req.params.productId;
  let pro=await findProduct(productId);
  res.render("ProductDetail.ejs", {
    product: pro,
    isLogged: req.isAuthenticated() && (req.user.role == "buyer"),
    manager : manager
  });
};

