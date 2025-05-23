import { findProducts,findProduct,findProductsByCategory } from "../models/MongoUser.js";

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
  console.log(pro);
  res.render("ProductDetail", {
    product: pro,
    sellerId:pro.seller?.email,
    isLogged: req.isAuthenticated() && (req.user.role == "buyer"),
    manager : req.isAuthenticated() && (req.user.role == "manager"),
    hisProduct : req.isAuthenticated() && (req.user.role == "seller") && (req.user.email === pro.seller?.email) && (pro.sold < 2),
    seller: req.isAuthenticated() && (req.user.role == "seller"),
    sold1: req.isAuthenticated() && (req.user.role == "seller") && (req.user.email === pro.seller?.email) && (pro.sold ==1)
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

