import { findProducts, findProduct, findProductsByCategory } from "../models/MongoUser.js";
import { verifyJwt } from "../routes/buyerRoutes.js";
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

export const getProductsNoFilter = async (req, res) => {
  let isLogged = false;

  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "buyer");
    }
  } catch (err) {
    isLogged = false;
  }
  // console.log("start");

  let name = req.query.search;
  let response = await fetch(`http://localhost:3000/anyone/products/filtered?name=${name}`);
  let data = await response.json();
  console.log(response.status);
  console.log(data);
  
  return res.render("searchPage", {
    products: data.products,
    isLogged: isLogged
  });
}

export const getProductDetails = async (req, res) => {
  let isLogged = false;
  let decoded;
  try {
    if (req.cookies.token) {
      decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      // console.log(decoded);
      isLogged = true;
    }
  } catch (err) {
    isLogged = false;
  }

  const productId = req.params.productId;
  let response = await fetch(`http://localhost:3000/anyone/products/${productId}`);
  let data = await response.json();
  if (!data.success) {
    return res.status(response.status).json(data.message);
  }
  const pro = data.product;
  // console.log(pro);
  res.render("ProductDetail", {
    product: pro,
    sellerId: pro.seller,
    isLogged: isLogged && (decoded.role == "buyer"),
    manager: isLogged && (decoded.role == "manager"),
    hisProduct: isLogged && (decoded.role == "seller") && (decoded._id === pro.seller) && (!pro.soldTo),
    seller: isLogged && (decoded.role == "seller"),
    sold1: isLogged && (decoded.role == "seller") && (decoded._id === pro.seller) && (pro.requests.length > 0)
  });
};

export const getProductBycategory = async (req, res) => {
  let isLogged = false;

  try {
    if (req.cookies.token) {
      const decoded = await verifyJwt(req.cookies.token, process.env.JWT_SECRET);
      isLogged = (decoded.role == "buyer");
    }
  } catch (err) {
    isLogged = false;
  }

  const category = req.params.category;
  let response = await fetch(`http://localhost:3000/products/filtered?category=${encodeURIComponent(category)}`);
  let data = await response.json();
  res.render("searchPage", {
    products: data.products,
    isLogged: isLogged,
  });
}

